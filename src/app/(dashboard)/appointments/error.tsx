'use client'

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, RefreshCcw } from "lucide-react";

export default function AppointmentsError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Card className="max-w-md w-full border-0 shadow-lg bg-white">
        <CardContent className="pt-10 pb-8 px-8 text-center space-y-6">
          <div className="mx-auto w-16 h-16 bg-red-50 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-gray-900">Failed to load appointments</h2>
            <p className="text-sm text-gray-500 leading-relaxed">
              We encountered an issue while retrieving your schedule. Please try again or contact support if the problem persists.
            </p>
          </div>

          <Button 
            onClick={() => reset()}
            className="w-full py-6 text-base font-medium bg-blue-600 hover:bg-blue-700"
          >
            <RefreshCcw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
