
import { AuthForm } from "@/components/auth/AuthForm";
import { Stethoscope } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[oklch(0.1_0.02_240)] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-blue-500/10 rounded-full blur-[140px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-500/10 rounded-full blur-[120px] animate-pulse delay-1000" />
      <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-purple-500/10 rounded-full blur-[100px] animate-pulse delay-500" />

      <div className="max-w-md w-full bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-10 shadow-2xl relative z-10 transition-all">
        {/* Logo / Branding */}
        <div className="flex flex-col items-center text-center mb-10">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl flex items-center justify-center shadow-lg shadow-blue-500/20 mb-6 rotate-3 hover:rotate-0 transition-transform duration-500">
            <Stethoscope className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-black text-white mb-2 tracking-tight">
            Owner <span className="text-blue-500">Login</span>
          </h1>
          <p className="text-white/40 font-medium tracking-wide text-sm uppercase">
            Clinic Management Portal
          </p>
        </div>

        <AuthForm />

        <div className="mt-10 pt-8 border-t border-white/5 text-center">
          <p className="text-sm text-white/40">
            Don't have an account?{' '}
            <a href="/create-clinic" className="text-blue-400 font-bold hover:text-blue-300 transition-colors">
              Register Clinic
            </a>
          </p>
        </div>
      </div>

      {/* Footer Branding */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3 opacity-20 hover:opacity-50 transition-opacity">
        <p className="text-[10px] text-white font-bold tracking-[0.2em] uppercase">
          Powered by Antigravity OS
        </p>
      </div>
    </div>
  );
}
