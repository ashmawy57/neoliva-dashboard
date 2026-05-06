import { Hospital, Clock, XCircle } from "lucide-react";
import Link from "next/link";

interface StatusPageProps {
  title: string;
  message: string;
  type: 'PENDING' | 'REJECTED';
}

export default function StatusPage({ title, message, type }: StatusPageProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-blue-100 rounded-full blur-[120px] opacity-40 animate-pulse"></div>
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-indigo-100 rounded-full blur-[100px] opacity-40 animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative z-10 w-full max-w-md px-4">
        <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-slate-100 p-10 text-center">
          <div className="flex justify-center mb-8">
            <div className={`w-20 h-20 rounded-3xl flex items-center justify-center shadow-lg ${
              type === 'PENDING' ? 'bg-amber-100 text-amber-600 shadow-amber-100' : 'bg-red-100 text-red-600 shadow-red-100'
            }`}>
              {type === 'PENDING' ? <Clock className="w-10 h-10" /> : <XCircle className="w-10 h-10" />}
            </div>
          </div>

          <h1 className="text-3xl font-extrabold text-slate-900 mb-4">{title}</h1>
          <p className="text-slate-500 mb-10 leading-relaxed">
            {message}
          </p>

          <div className="space-y-4">
            <Link 
              href="/" 
              className="block w-full py-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl transition-all active:scale-[0.98]"
            >
              Back to Home
            </Link>
            <Link 
              href="/login" 
              className="block w-full py-4 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-2xl transition-all active:scale-[0.98]"
            >
              Try Different Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
