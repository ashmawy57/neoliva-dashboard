"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, RotateCcw, Home } from "lucide-react";
import Link from "next/link";

interface RouteErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
  title?: string;
}

export default function RouteError({ error, reset, title = "Something went wrong" }: RouteErrorProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("[RouteError]", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-6 text-center animate-fade-in">
      <div className="p-4 rounded-full bg-red-50 text-red-500 mb-6">
        <AlertCircle className="w-12 h-12" />
      </div>
      
      <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
      <p className="text-gray-500 max-w-md mb-8">
        We encountered an unexpected error while loading this page. Our team has been notified.
      </p>

      <div className="flex flex-col sm:flex-row gap-3">
        <Button 
          onClick={() => reset()} 
          className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 shadow-lg shadow-blue-200"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Try Again
        </Button>
        
        <Link href="/dashboard">
          <Button variant="outline" className="rounded-xl border-gray-200 text-gray-600 px-6 py-2">
            <Home className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
      </div>
      
      {error.digest && (
        <p className="mt-8 text-xs text-gray-400 font-mono">
          Error ID: {error.digest}
        </p>
      )}
    </div>
  );
}
