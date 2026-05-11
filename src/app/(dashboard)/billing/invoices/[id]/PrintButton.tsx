"use client";

import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";

export function PrintButton() {
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get("print") === "true") {
      // Small delay to ensure styles are loaded
      const timer = setTimeout(() => {
        window.print();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  return (
    <Button 
      variant="outline" 
      className="rounded-xl h-9 text-sm"
      onClick={() => window.print()}
    >
      <Printer className="w-4 h-4 mr-2" /> Print
    </Button>
  );
}
