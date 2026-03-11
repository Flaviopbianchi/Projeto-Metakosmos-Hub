"use client";

import { Bell, Search } from "lucide-react";

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-white/10">
      <div>
        <h1 className="text-white font-semibold text-xl">{title}</h1>
        {subtitle && <p className="text-white/40 text-sm">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-3">
        <button className="p-2 rounded-lg text-white/50 hover:text-white hover:bg-white/5 transition-colors">
          <Search size={18} />
        </button>
        <button className="p-2 rounded-lg text-white/50 hover:text-white hover:bg-white/5 transition-colors">
          <Bell size={18} />
        </button>
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
          <span className="text-white text-xs font-bold">F</span>
        </div>
      </div>
    </header>
  );
}
