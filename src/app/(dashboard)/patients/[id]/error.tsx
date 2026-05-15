"use client";

import { useEffect } from "react";
import { AlertCircle, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PatientProfileError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[PatientProfileError]:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="w-20 h-20 rounded-3xl bg-rose-50 flex items-center justify-center mb-6 shadow-sm border border-rose-100">
        <AlertCircle className="w-10 h-10 text-rose-500" />
      </div>
      
      <h2 className="text-2xl font-bold text-slate-900 mb-2">Something went wrong</h2>
      <p className="text-slate-500 text-center max-w-md mb-8">
        We encountered an error while loading the patient profile. This might be a temporary issue.
      </p>

      <div className="flex items-center gap-4">
        <Button 
          onClick={reset}
          className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl px-6 h-12 shadow-lg shadow-slate-200 transition-all active:scale-95"
        >
          <RefreshCcw className="w-4 h-4 mr-2" />
          Try Again
        </Button>
        
        <Button 
          variant="outline"
          onClick={() => window.location.href = '/patients'}
          className="rounded-xl px-6 h-12 border-slate-200 hover:bg-slate-50 transition-all"
        >
          Back to List
        </Button>
      </div>
    </div>
  );
}
