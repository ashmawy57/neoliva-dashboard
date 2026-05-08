"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { LogOut, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AdminLogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await fetch("/api/admin/logout", { method: "POST" });
      router.push("/admin/login");
      router.refresh();
    } catch {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleLogout}
      disabled={loading}
      variant="outline"
      className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 gap-2"
    >
      {loading ? (
        <><Loader2 className="w-4 h-4 animate-spin" /> Logging out...</>
      ) : (
        <><LogOut className="w-4 h-4" /> Logout</>
      )}
    </Button>
  );
}
