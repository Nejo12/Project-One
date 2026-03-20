import { afterEach, describe, expect, it } from "vitest";
import {
  clearStoredAuthSession,
  readStoredAuthSession,
  writeStoredAuthSession,
} from "./auth-session";

describe("auth session storage", () => {
  afterEach(() => {
    clearStoredAuthSession();
  });

  it("writes and reads the stored auth session", () => {
    writeStoredAuthSession({
      user: {
        id: "user_1",
        email: "user@example.com",
        displayName: "User Example",
        status: "ACTIVE",
        emailVerifiedAt: "2026-03-20T00:00:00.000Z",
      },
      session: {
        accessToken: "header.payload.signature",
        tokenType: "Bearer",
        expiresAt: "2026-03-27T00:00:00.000Z",
      },
    });

    expect(readStoredAuthSession()).toMatchObject({
      user: { email: "user@example.com" },
      session: { tokenType: "Bearer" },
    });
  });

  it("clears invalid stored session payloads", () => {
    window.localStorage.setItem("project-one.auth.session", "{invalid-json");

    expect(readStoredAuthSession()).toBeNull();
    expect(window.localStorage.getItem("project-one.auth.session")).toBeNull();
  });
});
