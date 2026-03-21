import { useSyncExternalStore } from "react";
import { StoredAuthSession } from "@/lib/auth-contract";

const AUTH_SESSION_STORAGE_KEY = "project-one.auth.session";
const authSessionListeners = new Set<() => void>();
let cachedAuthSessionRawValue: string | null | undefined;
let cachedAuthSessionSnapshot: StoredAuthSession | null = null;

function notifyAuthSessionListeners() {
  authSessionListeners.forEach((listener) => listener());
}

function cacheAuthSessionSnapshot(
  rawValue: string | null,
  snapshot: StoredAuthSession | null,
): StoredAuthSession | null {
  cachedAuthSessionRawValue = rawValue;
  cachedAuthSessionSnapshot = snapshot;
  return cachedAuthSessionSnapshot;
}

function subscribeToAuthSession(onStoreChange: () => void): () => void {
  authSessionListeners.add(onStoreChange);

  function handleStorage(event: StorageEvent) {
    if (event.key === AUTH_SESSION_STORAGE_KEY) {
      onStoreChange();
    }
  }

  if (typeof window !== "undefined") {
    window.addEventListener("storage", handleStorage);
  }

  return () => {
    authSessionListeners.delete(onStoreChange);

    if (typeof window !== "undefined") {
      window.removeEventListener("storage", handleStorage);
    }
  };
}

export function readStoredAuthSession(): StoredAuthSession | null {
  if (typeof window === "undefined") {
    return null;
  }

  const rawValue = window.localStorage.getItem(AUTH_SESSION_STORAGE_KEY);
  if (rawValue === cachedAuthSessionRawValue) {
    return cachedAuthSessionSnapshot;
  }

  if (!rawValue) {
    return cacheAuthSessionSnapshot(null, null);
  }

  try {
    return cacheAuthSessionSnapshot(rawValue, JSON.parse(rawValue) as StoredAuthSession);
  } catch {
    window.localStorage.removeItem(AUTH_SESSION_STORAGE_KEY);
    return cacheAuthSessionSnapshot(null, null);
  }
}

export function writeStoredAuthSession(session: StoredAuthSession): void {
  if (typeof window === "undefined") {
    return;
  }

  const rawValue = JSON.stringify(session);
  window.localStorage.setItem(AUTH_SESSION_STORAGE_KEY, rawValue);
  cacheAuthSessionSnapshot(rawValue, session);
  notifyAuthSessionListeners();
}

export function clearStoredAuthSession(): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(AUTH_SESSION_STORAGE_KEY);
  cacheAuthSessionSnapshot(null, null);
  notifyAuthSessionListeners();
}

export function useStoredAuthSession(): StoredAuthSession | null {
  return useSyncExternalStore(subscribeToAuthSession, readStoredAuthSession, () => null);
}
