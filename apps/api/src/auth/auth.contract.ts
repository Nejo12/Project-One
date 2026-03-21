/**
 * Browser-to-API auth contract used by the web app and by tests.
 * Temporary token preview fields are preview-mode only and should not be used in production.
 */
export interface AuthUserView {
  id: string;
  email: string;
  displayName: string | null;
  status: 'PENDING_VERIFICATION' | 'ACTIVE' | 'DISABLED';
  emailVerifiedAt: string | null;
}

export interface AuthSessionView {
  accessToken: string;
  tokenType: 'Bearer';
  expiresAt: string;
}

export interface TokenPreview {
  token: string;
  expiresAt: string;
}

export interface SignUpRequestBody {
  email: string;
  password: string;
  displayName?: string;
}

export interface SignUpResponse {
  user: AuthUserView;
  nextStep: 'verify_email';
  verification?: TokenPreview;
}

export interface VerifyEmailRequestBody {
  token: string;
}

export interface VerifyEmailResponse {
  user: AuthUserView;
  session: AuthSessionView;
}

export interface LoginRequestBody {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: AuthUserView;
  session: AuthSessionView;
}

export interface PasswordResetRequestBody {
  email: string;
}

export interface PasswordResetRequestResponse {
  accepted: true;
  reset?: TokenPreview;
}

export interface PasswordResetConfirmRequestBody {
  token: string;
  newPassword: string;
}

export interface PasswordResetConfirmResponse {
  user: AuthUserView;
  session: AuthSessionView;
}

export interface MeResponse {
  user: AuthUserView;
}
