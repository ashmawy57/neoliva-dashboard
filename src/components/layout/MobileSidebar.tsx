"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Calendar, Users, Stethoscope,
  FileText, Package, UserCog, BarChart3, Settings,
  Truck, Wallet, Activity
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Appointments", href: "/appointments", icon: Calendar },
  { name: "Patients", href: "/patients", icon: Users },
  { name: "Services", href: "/services", icon: Stethoscope },
  { name: "Lab Orders", href: "/lab-orders", icon: Truck },
  { name: "Billing", href: "/billing", icon: FileText },
  { name: "Expenses", href: "/expenses", icon: Wallet },
  { name: "Inventory", href: "/inventory", icon: Package },
  { name: "Staff", href: "/staff", icon: UserCog },
  { name: "Reports", href: "/reports", icon: BarChart3 },
  { name: "Operations", href: "/dashboard/operations", icon: Activity },
  { name: "Settings", href: "/settings", icon: Settings },
];

import { signOut } from "@/app/actions/signout";
import { useState } from "react";
import { LogOut, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function MobileSidebar({ settings }: { settings?: { clinicName: string; logoUrl: string | null } }) {
  const pathname = usePathname();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut();
    } catch (error: any) {
      if (error?.digest?.includes('NEXT_REDIRECT') || error?.message === 'NEXT_REDIRECT') {
        throw error;
      }
      console.error('Logout error:', error);
      toast.error("Failed to log out");
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="flex flex-col h-full text-white">
      <div className="flex items-center gap-3 px-5 h-16 border-b border-white/[0.06]">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20 overflow-hidden">
          {settings?.logoUrl ? (
            <img src={settings.logoUrl} alt="Clinic Logo" className="w-full h-full object-cover" />
          ) : (
            <Stethoscope className="w-5 h-5 text-white" />
          )}
        </div>
        <div>
          <h2 className="text-[15px] font-bold tracking-tight">{settings?.clinicName || "SmileCare"}</h2>
          <p className="text-[10px] text-blue-300/70 font-medium tracking-widest uppercase">Pro Dashboard</p>
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-200",
                isActive
                  ? "bg-white/10 text-white"
                  : "text-white/50 hover:text-white/90 hover:bg-white/[0.05]"
              )}
            >
              <item.icon className={cn(
                "w-[18px] h-[18px] transition-colors",
                isActive ? "text-blue-400" : "text-white/40"
              )} />
              <span className="text-[13px] font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Logout in mobile sidebar */}
      <div className="p-4 border-t border-white/[0.06]">
        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] transition-all text-white/70 hover:text-white"
        >
          {isLoggingOut ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <LogOut className="w-5 h-5 text-rose-400" />
          )}
          <span className="font-semibold text-sm">Log Out</span>
        </button>
      </div>
    </div>
  );
}
