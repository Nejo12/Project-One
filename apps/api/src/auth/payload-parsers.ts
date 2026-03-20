import { BadRequestException } from '@nestjs/common';
import {
  LoginRequestBody,
  PasswordResetConfirmRequestBody,
  PasswordResetRequestBody,
  SignUpRequestBody,
  VerifyEmailRequestBody,
} from './auth.contract';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function ensureObject(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new BadRequestException('Request body must be an object.');
  }

  return value as Record<string, unknown>;
}

function readRequiredString(
  input: Record<string, unknown>,
  fieldName: string,
  minimumLength = 1,
): string {
  const value = input[fieldName];
  if (typeof value !== 'string') {
    throw new BadRequestException(`${fieldName} must be a string.`);
  }

  const normalized = value.trim();
  if (normalized.length < minimumLength) {
    throw new BadRequestException(
      `${fieldName} must be at least ${minimumLength} characters long.`,
    );
  }

  return normalized;
}

function readOptionalString(
  input: Record<string, unknown>,
  fieldName: string,
): string | undefined {
  const value = input[fieldName];
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  if (typeof value !== 'string') {
    throw new BadRequestException(`${fieldName} must be a string.`);
  }

  return value.trim();
}

function normalizeEmail(email: string): string {
  const normalized = email.trim().toLowerCase();
  if (!emailPattern.test(normalized)) {
    throw new BadRequestException('email must be a valid email address.');
  }

  return normalized;
}

export function parseSignUpBody(body: unknown): SignUpRequestBody {
  const input = ensureObject(body);
  const displayName = readOptionalString(input, 'displayName');

  return {
    email: normalizeEmail(readRequiredString(input, 'email')),
    password: readRequiredString(input, 'password', 8),
    displayName,
  };
}

export function parseVerifyEmailBody(body: unknown): VerifyEmailRequestBody {
  const input = ensureObject(body);
  return {
    token: readRequiredString(input, 'token', 16),
  };
}

export function parseLoginBody(body: unknown): LoginRequestBody {
  const input = ensureObject(body);
  return {
    email: normalizeEmail(readRequiredString(input, 'email')),
    password: readRequiredString(input, 'password', 8),
  };
}

export function parsePasswordResetRequestBody(
  body: unknown,
): PasswordResetRequestBody {
  const input = ensureObject(body);
  return {
    email: normalizeEmail(readRequiredString(input, 'email')),
  };
}

export function parsePasswordResetConfirmBody(
  body: unknown,
): PasswordResetConfirmRequestBody {
  const input = ensureObject(body);
  return {
    token: readRequiredString(input, 'token', 16),
    newPassword: readRequiredString(input, 'newPassword', 8),
  };
}
