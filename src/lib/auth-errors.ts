
export type AuthErrorCode = 
  | 'EMAIL_NOT_CONFIRMED'
  | 'EMAIL_EXPIRED'
  | 'INVALID_CREDENTIALS'
  | 'SESSION_EXPIRED'
  | 'INVITE_EXPIRED'
  | 'ACCOUNT_SUSPENDED'
  | 'TENANT_PENDING'
  | 'UNKNOWN_ERROR';

export interface AuthErrorDetails {
  title: string;
  description: string;
  severity: 'info' | 'warning' | 'error';
  recoveryAction?: {
    label: string;
    path?: string;
    action?: string; // identifier for server action
  };
}

export const AUTH_ERRORS: Record<AuthErrorCode, AuthErrorDetails> = {
  EMAIL_NOT_CONFIRMED: {
    title: 'Verify your email',
    description: 'We sent a verification link to your email. Please click it to confirm your account.',
    severity: 'warning',
    recoveryAction: {
      label: 'Resend Verification Email',
      action: 'RESEND_EMAIL'
    }
  },
  EMAIL_EXPIRED: {
    title: 'Link expired',
    description: 'Your verification link has expired or has already been used.',
    severity: 'error',
    recoveryAction: {
      label: 'Request New Link',
      action: 'RESEND_EMAIL'
    }
  },
  INVALID_CREDENTIALS: {
    title: 'Invalid credentials',
    description: 'The email or password you entered is incorrect. Please try again.',
    severity: 'error',
    recoveryAction: {
      label: 'Back to Login',
      path: '/login'
    }
  },
  SESSION_EXPIRED: {
    title: 'Session expired',
    description: 'Your session has ended for security reasons. Please sign in again.',
    severity: 'info',
    recoveryAction: {
      label: 'Sign In',
      path: '/login'
    }
  },
  INVITE_EXPIRED: {
    title: 'Invitation expired',
    description: 'This invitation has expired. Please contact your clinic administrator for a new one.',
    severity: 'error',
    recoveryAction: {
      label: 'Back to Safety',
      path: '/'
    }
  },
  ACCOUNT_SUSPENDED: {
    title: 'Account suspended',
    description: 'Access to your account has been suspended. Please contact support if you believe this is an error.',
    severity: 'error',
    recoveryAction: {
      label: 'Contact Support',
      path: 'mailto:support@neoliva.com'
    }
  },
  TENANT_PENDING: {
    title: 'Clinic pending approval',
    description: 'Your clinic registration is currently under review. We will notify you once it is approved.',
    severity: 'info',
    recoveryAction: {
      label: 'Check Status',
      path: '/login'
    }
  },
  UNKNOWN_ERROR: {
    title: 'Something went wrong',
    description: 'An unexpected error occurred during authentication. Please try again later.',
    severity: 'error',
    recoveryAction: {
      label: 'Try Again',
      path: '/login'
    }
  }
};

import { logger } from "./logger";

export function getAuthError(code: string | null): AuthErrorDetails {
  const error = (!code || !(code in AUTH_ERRORS)) 
    ? AUTH_ERRORS.UNKNOWN_ERROR 
    : AUTH_ERRORS[code as AuthErrorCode];

  if (code) {
    logger.warn(`Auth Error Resolved: ${code}`, { 
      errorTitle: error.title,
      severity: error.severity 
    });
  }

  return error;
}
