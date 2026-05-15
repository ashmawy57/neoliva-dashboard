"use client";

import RouteError from "@/components/shared/RouteError";

export default function InventoryError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <RouteError 
      error={error} 
      reset={reset} 
      title="Inventory system error" 
    />
  );
}
