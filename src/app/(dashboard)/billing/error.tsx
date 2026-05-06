'use client'

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, RotateCcw } from "lucide-react";

export default function BillingError({
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
          <div className="mx-auto w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-amber-500" />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-gray-900">Financial Data Unavailable</h2>
            <p className="text-sm text-gray-500 leading-relaxed">
              We couldn't retrieve your billing information at this moment. This might be a temporary connection issue.
            </p>
          </div>

          <Button 
            onClick={() => reset()}
            className="w-full py-6 text-base font-medium bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Retry Connection
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
