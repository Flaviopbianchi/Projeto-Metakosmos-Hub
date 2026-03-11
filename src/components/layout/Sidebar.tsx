"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CheckSquare,
  MessageSquare,
  Calendar,
  Mail,
  ShoppingBag,
  HardDrive,
  BookOpen,
  BarChart2,
  Star,
  Share2,
} from "lucide-react";
import { clsx } from "clsx";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/linear", label: "Linear", icon: CheckSquare },
  { href: "/slack", label: "Slack", icon: MessageSquare },
  { href: "/agenda", label: "Agenda", icon: Calendar },
  { href: "/email", label: "Email", icon: Mail },
  { href: "/analytics", label: "Analytics", icon: BarChart2 },
  { href: "/loja", label: "Loja", icon: ShoppingBag },
  { href: "/drive", label: "Drive", icon: HardDrive },
  { href: "/marca", label: "Manual de Marca", icon: BookOpen },
];

const socialLinks = [
  { href: "https://instagram.com/metakosmos", label: "Instagram" },
  { href: "https://linkedin.com/company/metakosmos", label: "LinkedIn" },
  { href: "https://twitter.com/metakosmos", label: "Twitter / X" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex flex-col w-64 min-h-screen bg-[#0a0a0f] border-r border-white/10 px-4 py-6">
      {/* Logo */}
      <div className="flex items-center gap-3 mb-8 px-2">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
          <span className="text-white text-xs font-bold">M</span>
        </div>
        <span className="text-white font-semibold text-lg tracking-tight">
          Metakosmos
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                active
                  ? "bg-violet-600/20 text-violet-400"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              )}
            >
              <Icon size={16} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Redes Sociais */}
      <div className="mt-6 pt-4 border-t border-white/10">
        <p className="text-white/30 text-xs uppercase tracking-wider px-3 mb-2">
          Redes Sociais
        </p>
        <div className="space-y-1">
          {socialLinks.map(({ href, label }) => (
            <a
              key={href}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-white/50 hover:text-white hover:bg-white/5 transition-colors"
            >
              <Share2 size={14} />
              {label}
            </a>
          ))}
        </div>
      </div>
    </aside>
  );
}
