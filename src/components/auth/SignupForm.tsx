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
        setError("Missing invitation token.");
        setLoading(false);
        return;
      }

      const result = await validateInviteToken(token);
      if (result.valid) {
        setIsValid(true);
        setEmail(result.email || "");
      } else {
        setError(result.error || "Invalid invitation.");
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
      <div className="flex flex-col items-center justify-center p-12">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600 mb-4" />
        <p className="text-slate-500 font-medium animate-pulse">Verifying invitation...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md px-6 z-10">
      <div className="bg-white/80 backdrop-blur-xl border border-white rounded-[2.5rem] shadow-2xl shadow-blue-100/50 p-8 md:p-10">
        <div className="flex flex-col items-center mb-10">
          <Link href="/" className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-200 hover:scale-105 transition-transform">
            <Hospital className="text-white w-10 h-10" />
          </Link>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight text-center">Complete Setup</h1>
          <p className="text-slate-500 mt-2 font-medium text-center">Join your clinic's digital workspace</p>
        </div>

        {!isValid ? (
          <div className="p-8 bg-red-50 border border-red-100 rounded-[2rem] flex flex-col items-center text-center animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-red-900 font-bold text-lg mb-2">Invalid Invitation</h2>
            <p className="text-red-600 text-sm mb-6 leading-relaxed">
              {error || "This invitation link is invalid, expired, or has already been used."}
            </p>
            <Link 
              href="/login" 
              className="px-6 py-2.5 bg-white border border-red-200 text-red-600 text-sm font-bold rounded-xl hover:bg-red-50 transition-colors shadow-sm"
            >
              Go to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <input type="hidden" name="token" value={token || ""} />
            
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1" htmlFor="email">
                Verified Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  defaultValue={email || ""}
                  readOnly
                  className="block w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-500 cursor-not-allowed font-medium"
                />
                <div className="absolute inset-y-0 right-4 flex items-center">
                  <UserCheck className="w-5 h-5 text-green-500" />
                </div>
              </div>
              <p className="text-[10px] text-slate-400 mt-1.5 ml-1 flex items-center gap-1 font-bold tracking-tight">
                <ShieldCheck className="w-3 h-3" /> PRE-VERIFIED BY ADMINISTRATOR
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1" htmlFor="password">
                Create Password
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none group-focus-within:text-blue-600 transition-colors">
                  <KeyRound className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  minLength={8}
                  className="block w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium"
                  placeholder="Min. 8 characters"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1" htmlFor="confirmPassword">
                Confirm Password
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none group-focus-within:text-blue-600 transition-colors">
                  <KeyRound className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  className="block w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium"
                  placeholder="Repeat password"
                />
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-2xl flex items-center gap-3">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span className="font-medium">{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={signingUp}
              className="w-full flex items-center justify-center py-4 px-6 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl transition-all shadow-xl shadow-blue-100 hover:shadow-blue-200 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed group"
            >
              {signingUp ? (
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
              ) : null}
              {signingUp ? "Creating Account..." : (
                <>
                  Complete Registration
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
        )}

        <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col items-center gap-4">
          <p className="text-slate-500 text-sm font-medium">
            Already have an account? <Link href="/login" className="text-blue-600 font-bold hover:underline">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
