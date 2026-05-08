'use client';

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { updatePassword } from "@/app/actions/password-reset";
import { KeyRound, Eye, EyeOff, Loader2, Hospital, CheckCircle2, AlertCircle, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { createBrowserClient } from "@supabase/ssr";

// ── Inner component that uses useSearchParams() ──────────────────────────────
function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);
  const [sessionError, setSessionError] = useState(false);
  const [password, setPassword] = useState('');

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) { 
        setSessionReady(true); 
        return; 
      }

      // If no session is found, wait a bit for auth state changes 
      // (in case of implicit flow or local storage syncing)
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
        if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') setSessionReady(true);
      });

      setTimeout(async () => {
        const { data: { session: s } } = await supabase.auth.getSession();
        if (!s) setSessionError(true); 
        else setSessionReady(true);
        subscription.unsubscribe();
      }, 2000);
    };

    init();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const formData = new FormData(e.currentTarget);
    const result = await updatePassword(formData);
    if (result.success) {
      setSuccess(true);
      setTimeout(() => router.push('/dashboard'), 2500);
    } else {
      setError(result.error || 'Something went wrong');
    }
    setLoading(false);
  };

  // Password strength
  const getStrength = (pw: string) => {
    let s = 0;
    if (pw.length >= 8) s++;
    if (/[A-Z]/.test(pw)) s++;
    if (/[0-9]/.test(pw)) s++;
    if (/[^A-Za-z0-9]/.test(pw)) s++;
    return s;
  };
  const strength = getStrength(password);
  const strengthLabels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  const strengthColors = ['', 'bg-red-400', 'bg-amber-400', 'bg-blue-400', 'bg-emerald-400'];

  return (
    <div className="bg-white/80 backdrop-blur-xl border border-white rounded-[2.5rem] shadow-2xl shadow-blue-100/50 p-8 md:p-10">
      {/* Logo */}
      <div className="flex flex-col items-center mb-8">
        <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-200">
          <Hospital className="text-white w-10 h-10" />
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          {success ? 'Password Updated!' : 'Set New Password'}
        </h1>
        <p className="text-slate-500 mt-2 font-medium text-center text-sm">
          {success ? 'Redirecting you to the dashboard...' : 'Choose a strong password for your account'}
        </p>
      </div>

      {/* Success */}
      {success && (
        <div className="flex flex-col items-center gap-4 py-4">
          <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8 text-emerald-500" />
          </div>
          <p className="text-sm text-slate-500 text-center">Your password has been updated successfully.</p>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Loader2 className="w-3 h-3 animate-spin" /> Redirecting...
          </div>
        </div>
      )}

      {/* Expired / invalid link */}
      {!success && sessionError && (
        <div className="space-y-6">
          <div className="flex flex-col items-center gap-4 py-4">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-red-400" />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-slate-700">Link expired or invalid</p>
              <p className="text-sm text-slate-500 mt-1">This reset link has expired or already been used.</p>
            </div>
          </div>
          <Link href="/forgot-password"
            className="w-full flex items-center justify-center py-4 px-6 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl transition-all shadow-xl shadow-blue-100">
            Request New Link
          </Link>
        </div>
      )}

      {/* Verifying session */}
      {!success && !sessionError && !sessionReady && (
        <div className="flex flex-col items-center gap-4 py-8">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          <p className="text-sm text-slate-500">Verifying your reset link...</p>
        </div>
      )}

      {/* Password form */}
      {!success && sessionReady && !sessionError && (
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* New Password */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 ml-1" htmlFor="password">New Password</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <KeyRound className="h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
              </div>
              <input id="password" name="password"
                type={showPassword ? 'text' : 'password'}
                required minLength={8}
                value={password} onChange={(e) => setPassword(e.target.value)}
                className="block w-full pl-11 pr-12 py-3.5 bg-white border border-slate-200 rounded-2xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium"
                placeholder="Min. 8 characters" />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600">
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {/* Strength bar */}
            {password.length > 0 && (
              <div className="space-y-1 px-1">
                <div className="flex gap-1">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= strength ? strengthColors[strength] : 'bg-slate-100'}`} />
                  ))}
                </div>
                <p className={`text-xs font-medium ${strength <= 1 ? 'text-red-500' : strength === 2 ? 'text-amber-500' : strength === 3 ? 'text-blue-500' : 'text-emerald-500'}`}>
                  {strengthLabels[strength]}
                </p>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 ml-1" htmlFor="confirmPassword">Confirm Password</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <ShieldCheck className="h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
              </div>
              <input id="confirmPassword" name="confirmPassword"
                type={showConfirm ? 'text' : 'password'}
                required
                className="block w-full pl-11 pr-12 py-3.5 bg-white border border-slate-200 rounded-2xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium"
                placeholder="Repeat your password" />
              <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600">
                {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-2xl flex items-center gap-3">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span className="font-medium">{error}</span>
            </div>
          )}

          <button type="submit" disabled={loading}
            className="w-full flex items-center justify-center py-4 px-6 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl transition-all shadow-xl shadow-blue-100 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed">
            {loading ? <><Loader2 className="w-5 h-5 animate-spin mr-2" /> Updating...</> : 'Update Password'}
          </button>
        </form>
      )}
    </div>
  );
}

// ── Page export: wraps inner component in Suspense (required by Next.js) ──────
export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-blue-100 rounded-full blur-[120px] opacity-40 animate-pulse" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-indigo-100 rounded-full blur-[100px] opacity-40 animate-pulse" style={{ animationDelay: '2s' }} />
      </div>
      <div className="w-full max-w-md px-6 z-10">
        <Suspense fallback={
          <div className="bg-white/80 backdrop-blur-xl border border-white rounded-[2.5rem] shadow-2xl p-10 flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            <p className="text-sm text-slate-500">Loading...</p>
          </div>
        }>
          <ResetPasswordContent />
        </Suspense>
      </div>
    </div>
  );
}
