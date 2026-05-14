'use client'

import { useState, useEffect } from "react";
import { validateInviteToken, signupWithInvite } from "@/app/actions/auth";
import { KeyRound, Mail, Loader2, Hospital, ShieldCheck, AlertCircle, ArrowRight, UserCheck } from "lucide-react";
import Link from "next/link";

interface SignupFormProps {
  token: string | null;
}

export function SignupForm({ token }: SignupFormProps) {
  const [loading, setLoading] = useState(true);
  const [signingUp, setSigningUp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    async function checkToken() {
      if (!token) {
        window.location.href = '/auth/error?type=INVITE_EXPIRED';
        return;
      }

      const result = await validateInviteToken(token);
      if (result.valid) {
        setIsValid(true);
        setEmail(result.email || "");
      } else {
        window.location.href = '/auth/error?type=INVITE_EXPIRED';
      }
      setLoading(false);
    }

    checkToken();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const formData = new FormData(e.currentTarget);
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setSigningUp(true);
    setError(null);

    const result = await signupWithInvite(formData);

    if (result?.error) {
      setError(result.error);
      setSigningUp(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="w-12 h-12 animate-spin text-blue-500 mb-4" />
        <p className="text-white/40 font-medium animate-pulse">Securing invitation...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="hidden" name="token" value={token || ""} />
        
        <div className="space-y-2">
          <label className="text-sm font-medium text-white/70 ml-1">Email Address</label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
            <input
              name="email"
              type="email"
              defaultValue={email || ""}
              readOnly
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white/50 cursor-not-allowed"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-white/70 ml-1">Create Password</label>
          <div className="relative group">
            <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30 group-focus-within:text-blue-500 transition-colors" />
            <input
              name="password"
              type="password"
              required
              minLength={8}
              placeholder="••••••••"
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-white/70 ml-1">Confirm Password</label>
          <div className="relative group">
            <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30 group-focus-within:text-blue-500 transition-colors" />
            <input
              name="confirmPassword"
              type="password"
              required
              placeholder="••••••••"
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
            />
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-3 text-red-400">
            <AlertCircle className="w-5 h-5 mt-0.5" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={signingUp}
          className="w-full bg-white text-black font-bold py-4 rounded-2xl hover:bg-white/90 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {signingUp ? <Loader2 className="w-5 h-5 animate-spin" /> : <UserCheck className="w-5 h-5" />}
          {signingUp ? "Securing Account..." : "Accept Invitation"}
        </button>
      </form>

      <div className="pt-4 text-center">
        <Link href="/login" className="text-sm text-white/40 hover:text-white transition-colors">
          Already have an account? <span className="font-bold text-blue-400">Log in</span>
        </Link>
      </div>
    </div>
  );
}
