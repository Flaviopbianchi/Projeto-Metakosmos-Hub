"use client";

import { Bell, Search, LogIn, LogOut } from "lucide-react";
import { useSession, signIn, signOut } from "next-auth/react";
import Image from "next/image";

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  const { data: session, status } = useSession();

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

        {status === "authenticated" && session?.user ? (
          <div className="flex items-center gap-2">
            {session.user.image ? (
              <Image
                src={session.user.image}
                alt={session.user.name ?? ""}
                width={32}
                height={32}
                className="rounded-full"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
                <span className="text-white text-xs font-bold">
                  {session.user.name?.[0] ?? "U"}
                </span>
              </div>
            )}
            <button
              onClick={() => signOut()}
              className="p-2 rounded-lg text-white/30 hover:text-white hover:bg-white/5 transition-colors"
              title="Sair"
            >
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <button
            onClick={() => signIn("google")}
            className="flex items-center gap-2 px-3 py-1.5 bg-violet-600 hover:bg-violet-700 text-white text-sm rounded-lg transition-colors"
          >
            <LogIn size={14} />
            Entrar
          </button>
        )}
      </div>
    </header>
  );
}
