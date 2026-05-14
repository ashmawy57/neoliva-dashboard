
import { SignupForm } from "@/components/auth/SignupForm";
import { Stethoscope } from "lucide-react";

interface SignupPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function SignupPage({ searchParams }: SignupPageProps) {
  const params = await searchParams;
  const token = typeof params.token === 'string' ? params.token : null;

  return (
    <div className="min-h-screen bg-[oklch(0.1_0.02_240)] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-blue-500/10 rounded-full blur-[140px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-500/10 rounded-full blur-[120px] animate-pulse delay-1000" />

      <div className="max-w-md w-full bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-10 shadow-2xl relative z-10 transition-all">
        {/* Branding */}
        <div className="flex flex-col items-center text-center mb-10">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl flex items-center justify-center shadow-lg shadow-blue-500/20 mb-6 rotate-3">
            <Stethoscope className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-black text-white mb-2 tracking-tight">
            Join the <span className="text-blue-500">Workspace</span>
          </h1>
          <p className="text-white/40 font-medium text-sm">
            Complete your professional setup
          </p>
        </div>

        <SignupForm token={token} />
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 opacity-20">
        <p className="text-[10px] text-white font-bold tracking-[0.2em] uppercase">
          Enterprise Security Standard
        </p>
      </div>
    </div>
  );
}
