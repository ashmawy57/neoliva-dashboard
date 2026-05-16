
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  AlertCircle, 
  CheckCircle2, 
  Info, 
  ArrowLeft, 
  Mail, 
  RefreshCw,
  AlertTriangle,
  Lock,
  UserX,
  Ban
} from 'lucide-react';
import { getAuthError, AuthErrorCode } from '@/lib/auth-errors';
import { resendVerificationEmail } from '@/app/actions/auth';

interface ErrorPageProps {
  code: AuthErrorCode;
  email?: string;
}

export function ErrorPage({ code, email }: ErrorPageProps) {
  const error = getAuthError(code);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleAction = async () => {
    if (error.recoveryAction?.action === 'RESEND_EMAIL' && email) {
      setLoading(true);
      setMessage(null);
      try {
        const result = await resendVerificationEmail(email);
        if (result.success) {
          setMessage({ type: 'success', text: 'Verification email resent successfully!' });
        } else {
          setMessage({ type: 'error', text: result.error || 'Failed to resend email.' });
        }
      } catch (err) {
        setMessage({ type: 'error', text: 'An unexpected error occurred.' });
      } finally {
        setLoading(false);
      }
    }
  };

  const getIcon = () => {
    switch (code) {
      case 'EMAIL_NOT_CONFIRMED': return <Mail className="w-12 h-12 text-blue-500" />;
      case 'EMAIL_EXPIRED': return <RefreshCw className="w-12 h-12 text-orange-500" />;
      case 'INVALID_CREDENTIALS': return <Lock className="w-12 h-12 text-red-500" />;
      case 'SESSION_EXPIRED': return <Info className="w-12 h-12 text-blue-500" />;
      case 'INVITE_EXPIRED': return <AlertTriangle className="w-12 h-12 text-amber-500" />;
      case 'ACCOUNT_SUSPENDED': return <UserX className="w-12 h-12 text-red-600" />;
      case 'ACCOUNT_DISABLED': return <Ban className="w-12 h-12 text-red-700" />;
      case 'TENANT_PENDING': return <AlertCircle className="w-12 h-12 text-blue-400" />;
      default: return <AlertCircle className="w-12 h-12 text-red-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-[oklch(0.1_0.02_240)] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[120px] animate-pulse delay-700" />

      <div className="max-w-md w-full bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl relative z-10">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="mb-6 p-4 bg-white/5 rounded-2xl border border-white/10 shadow-inner">
            {getIcon()}
          </div>
          <h1 className="text-3xl font-bold text-white mb-3 tracking-tight">
            {error.title}
          </h1>
          <p className="text-white/60 leading-relaxed">
            {error.description}
          </p>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-2xl flex items-start gap-3 border ${
            message.type === 'success' 
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
              : 'bg-red-500/10 border-red-500/20 text-red-400'
          }`}>
            {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 mt-0.5" /> : <AlertCircle className="w-5 h-5 mt-0.5" />}
            <p className="text-sm font-medium">{message.text}</p>
          </div>
        )}

        <div className="space-y-3">
          {error.recoveryAction?.path ? (
            <Link 
              href={error.recoveryAction.path}
              className="w-full py-4 px-6 bg-white text-black font-semibold rounded-2xl flex items-center justify-center gap-2 hover:bg-white/90 transition-all active:scale-[0.98] shadow-lg shadow-white/5"
            >
              {error.recoveryAction.label}
            </Link>
          ) : error.recoveryAction?.action ? (
            <button
              onClick={handleAction}
              disabled={loading}
              className="w-full py-4 px-6 bg-white text-black font-semibold rounded-2xl flex items-center justify-center gap-2 hover:bg-white/90 transition-all disabled:opacity-50 disabled:active:scale-100 active:scale-[0.98] shadow-lg shadow-white/5"
            >
              {loading && <RefreshCw className="w-5 h-5 animate-spin" />}
              {error.recoveryAction.label}
            </button>
          ) : null}

          <Link 
            href="/login"
            className="w-full py-4 px-6 bg-white/5 text-white/70 font-semibold rounded-2xl flex items-center justify-center gap-2 hover:bg-white/10 transition-all hover:text-white border border-white/10"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Login
          </Link>
        </div>

        <div className="mt-8 pt-8 border-t border-white/5 text-center">
          <p className="text-xs text-white/30 font-medium uppercase tracking-widest">
            Dental Clinic SaaS Engine
          </p>
        </div>
      </div>
    </div>
  );
}
