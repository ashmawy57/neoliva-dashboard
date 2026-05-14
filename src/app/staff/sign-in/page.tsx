
import { StaffAuthForm } from "@/components/auth/StaffAuthForm";
import { Building2, ShieldCheck } from "lucide-react";
import Link from "next/link";

export default function StaffSignInPage() {
  return (
    <div className="min-h-screen bg-[oklch(0.05_0.02_240)] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Dynamic Background Elements - Slightly different for staff portal */}
      <div className="absolute top-[-10%] right-[-10%] w-[70%] h-[70%] bg-blue-600/5 rounded-full blur-[140px] animate-pulse" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-500/5 rounded-full blur-[120px] animate-pulse delay-1000" />

      <div className="max-w-md w-full bg-white/[0.02] backdrop-blur-3xl border border-white/5 rounded-[2.5rem] p-10 shadow-2xl relative z-10 transition-all">
        {/* Portal Branding */}
        <div className="flex flex-col items-center text-center mb-10">
          <div className="w-16 h-16 bg-gradient-to-br from-slate-700 to-slate-900 rounded-3xl flex items-center justify-center shadow-lg mb-6 group hover:scale-110 transition-transform duration-500">
            <Building2 className="w-8 h-8 text-blue-400" />
          </div>
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span className="text-[10px] font-bold text-emerald-500/80 uppercase tracking-[0.2em]">Secure Staff Access</span>
          </div>
          <h1 className="text-3xl font-black text-white mb-1 tracking-tight">
            Staff <span className="text-blue-500 font-medium">Portal</span>
          </h1>
          <p className="text-white/30 font-medium text-sm">
            Access your clinical dashboard
          </p>
        </div>

        <StaffAuthForm />

        <div className="mt-10 pt-8 border-t border-white/5 text-center flex flex-col gap-4">
          <p className="text-xs text-white/30">
            Forgot which clinic you belong to?{' '}
            <button className="text-blue-400 font-bold hover:text-blue-300 transition-colors">
              Help me find it
            </button>
          </p>
          <Link 
            href="/" 
            className="text-xs text-white/20 hover:text-white/40 transition-colors"
          >
            ← Back to Landing Page
          </Link>
        </div>
      </div>

      {/* Footer Branding */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3 opacity-10">
        <p className="text-[10px] text-white font-bold tracking-[0.4em] uppercase">
          NEOLIVA ENTERPRISE SECURITY
        </p>
      </div>
    </div>
  );
}
