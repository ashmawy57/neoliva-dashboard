'use client'

import { useState } from "react";
import { login } from "@/app/actions/auth";
import { KeyRound, Mail, Loader2, Hospital, AlertCircle, ArrowRight } from "lucide-react";
import Link from "next/link";

export function LoginForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const result = await login(formData);

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md px-6 z-10">
      <div className="bg-white/80 backdrop-blur-xl border border-white rounded-[2.5rem] shadow-2xl shadow-blue-100/50 p-8 md:p-10">
        <div className="flex flex-col items-center mb-10">
          <Link href="/" className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-200 hover:scale-105 transition-transform">
            <Hospital className="text-white w-10 h-10" />
          </Link>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Welcome Back</h1>
          <p className="text-slate-500 mt-2 font-medium">Sign in to your clinic dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 ml-1" htmlFor="email">
              Email Address
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-blue-600">
                <Mail className="h-5 w-5 text-slate-400" />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="block w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium"
                placeholder="name@clinic.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center ml-1">
              <label className="text-sm font-bold text-slate-700" htmlFor="password">
                Password
              </label>
              <button type="button" className="text-xs font-bold text-blue-600 hover:text-blue-700">Forgot?</button>
            </div>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-blue-600">
                <KeyRound className="h-5 w-5 text-slate-400" />
              </div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="block w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium"
                placeholder="••••••••"
              />
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span className="font-medium">{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center py-4 px-6 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl transition-all shadow-xl shadow-blue-100 hover:shadow-blue-200 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed group"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
            ) : null}
            {loading ? "Signing in..." : (
              <>
                Sign in to Dashboard
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        <div className="mt-10 pt-8 border-t border-slate-100 flex flex-col items-center gap-6">
          <p className="text-slate-500 text-sm font-medium">
            Don't have an account? <Link href="/signup" className="text-blue-600 font-bold hover:underline">Get an invite</Link>
          </p>
          <div className="flex gap-6">
            <button className="text-[10px] uppercase tracking-widest font-bold text-slate-400 hover:text-slate-600 transition-colors">Privacy Policy</button>
            <button className="text-[10px] uppercase tracking-widest font-bold text-slate-400 hover:text-slate-600 transition-colors">Support</button>
          </div>
        </div>
      </div>
    </div>
  );
}
