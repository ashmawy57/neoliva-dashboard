"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Calendar, Users, Stethoscope,
  FileText, Package, UserCog, BarChart3, Settings,
  ChevronLeft, LogOut, Moon, Sun, Truck, Wallet
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const navGroups = [
  {
    label: "Overview",
    items: [
      { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    ],
  },
  {
    label: "Clinical",
    items: [
      { name: "Appointments", href: "/appointments", icon: Calendar },
      { name: "Patients", href: "/patients", icon: Users },
      { name: "Services", href: "/services", icon: Stethoscope },
      { name: "Lab Orders", href: "/lab-orders", icon: Truck },
    ],
  },
  {
    label: "Financial",
    items: [
      { name: "Billing", href: "/billing", icon: FileText },
      { name: "Expenses", href: "/expenses", icon: Wallet },
      { name: "Inventory", href: "/inventory", icon: Package },
    ],
  },
  {
    label: "Management",
    items: [
      { name: "Staff", href: "/staff", icon: UserCog },
      { name: "Reports", href: "/reports", icon: BarChart3 },
      { name: "Settings", href: "/settings", icon: Settings },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "hidden md:flex flex-col h-full transition-all duration-300 ease-in-out relative z-20",
        "bg-[oklch(0.14_0.025_255)] text-white",
        collapsed ? "w-[72px]" : "w-[260px]"
      )}
    >
      {/* Logo */}
      <div className={cn(
        "flex items-center gap-3 px-5 h-16 border-b border-white/[0.06]",
        collapsed && "justify-center px-0"
      )}>
        <div className="relative flex-shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Stethoscope className="w-5 h-5 text-white" />
          </div>
          <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-[oklch(0.14_0.025_255)] animate-pulse-soft" />
        </div>
        {!collapsed && (
          <div className="animate-slide-in overflow-hidden">
            <h2 className="text-[15px] font-bold tracking-tight whitespace-nowrap">SmileCare</h2>
            <p className="text-[10px] text-blue-300/70 font-medium tracking-widest uppercase">Pro Dashboard</p>
          </div>
        )}
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-[68px] w-6 h-6 rounded-full bg-white shadow-lg border border-gray-200 flex items-center justify-center z-50 hover:scale-110 transition-transform"
      >
        <ChevronLeft className={cn("w-3.5 h-3.5 text-gray-600 transition-transform duration-300", collapsed && "rotate-180")} />
      </button>

      {/* Nav groups */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-4 px-3 space-y-6 scrollbar-none">
        {navGroups.map((group) => (
          <div key={group.label}>
            {!collapsed && (
              <p className="text-[10px] font-semibold tracking-[0.15em] uppercase text-blue-300/40 mb-2 px-3">
                {group.label}
              </p>
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    title={collapsed ? item.name : undefined}
                    className={cn(
                      "group relative flex items-center gap-3 rounded-xl transition-all duration-200",
                      collapsed ? "justify-center px-0 py-2.5 mx-auto w-11 h-11" : "px-3 py-2.5",
                      isActive
                        ? "bg-white/10 text-white shadow-sm"
                        : "text-white/50 hover:text-white/90 hover:bg-white/[0.05]"
                    )}
                  >
                    {isActive && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-blue-400 rounded-full" />
                    )}
                    <item.icon className={cn(
                      "flex-shrink-0 transition-colors duration-200",
                      collapsed ? "w-5 h-5" : "w-[18px] h-[18px]",
                      isActive ? "text-blue-400" : "text-white/40 group-hover:text-white/70"
                    )} />
                    {!collapsed && (
                      <span className={cn(
                        "text-[13px] font-medium whitespace-nowrap",
                        isActive ? "text-white" : ""
                      )}>
                        {item.name}
                      </span>
                    )}
                    {isActive && !collapsed && (
                      <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse-soft" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom section */}
      <div className={cn(
        "border-t border-white/[0.06] p-3",
        collapsed && "flex flex-col items-center"
      )}>
        {!collapsed ? (
          <div className="flex items-center gap-3 p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.07] transition-colors cursor-pointer group">
            <div className="relative">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs shadow-lg">
                DS
              </div>
              <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-[oklch(0.14_0.025_255)]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold text-white/90 truncate">Dr. Roufida Attia</p>
              <p className="text-[11px] text-white/40 truncate">Administrator</p>
            </div>
            <LogOut className="w-4 h-4 text-white/25 group-hover:text-white/60 transition-colors flex-shrink-0" />
          </div>
        ) : (
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs shadow-lg cursor-pointer">
            DS
          </div>
        )}
      </div>
    </aside>
  );
}
