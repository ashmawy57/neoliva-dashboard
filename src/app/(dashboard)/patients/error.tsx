'use client';

import { useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCcw } from "lucide-react";

export default function PatientsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4 p-6 bg-red-50/30 rounded-2xl border border-red-100">
      <div className="p-3 bg-red-100 rounded-full">
        <AlertCircle className="w-8 h-8 text-red-600" />
      </div>
      <div className="text-center space-y-2">
        <h2 className="text-xl font-bold text-gray-900">Something went wrong!</h2>
        <p className="text-gray-600 max-w-xs mx-auto">
          We couldn't load the patients list. Please try again or contact support if the problem persists.
        </p>
      </div>
      <Button 
        onClick={() => reset()}
        variant="outline"
        className="gap-2 border-red-200 hover:bg-red-50 hover:text-red-700"
      >
        <RefreshCcw className="w-4 h-4" />
        Try again
      </Button>
    </div>
  );
}
