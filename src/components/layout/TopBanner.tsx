"use client";

import { Bell, Search, Menu } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { MobileSidebar } from "./MobileSidebar";

export function TopBanner() {
  const [searchFocused, setSearchFocused] = useState(false);

  return (
    <header className="h-16 bg-white/80 backdrop-blur-xl border-b border-gray-200/60 flex items-center justify-between px-4 md:px-6 z-10 sticky top-0">
      {/* Mobile menu */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden mr-2 text-gray-500 h-10 w-10 rounded-md hover:bg-gray-100">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-[280px] bg-[oklch(0.14_0.025_255)] border-none">
          <MobileSidebar />
        </SheetContent>
      </Sheet>

      {/* Search */}
      <div className={`flex items-center flex-1 max-w-lg transition-all duration-300 ${searchFocused ? "max-w-2xl" : ""}`}>
        <div className="relative w-full group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
          <Input
            type="search"
            placeholder="Search patients, appointments..."
            className="w-full pl-10 h-10 bg-gray-50/80 border-gray-200/60 rounded-xl text-sm focus-visible:ring-2 focus-visible:ring-blue-500/20 focus-visible:border-blue-300 focus-visible:bg-white transition-all placeholder:text-gray-400"
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border border-gray-200 bg-gray-100 px-1.5 font-mono text-[10px] font-medium text-gray-400">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-1 ml-4">
        <Button
          variant="ghost"
          size="icon"
          className="relative text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-xl h-10 w-10"
        >
          <Bell className="h-[18px] w-[18px]" />
          <span className="absolute top-2 right-2 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
          </span>
        </Button>

        {/* Date */}
        <div className="hidden lg:flex items-center gap-2 ml-2 px-3 py-1.5 rounded-xl bg-gray-50 border border-gray-100">
          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse-soft" />
          <span className="text-xs font-medium text-gray-500">
            {new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
          </span>
        </div>
      </div>
    </header>
  );
}
