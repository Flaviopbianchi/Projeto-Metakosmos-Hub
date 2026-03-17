"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, CheckSquare, MessageSquare, Calendar, Mail,
  ShoppingBag, HardDrive, BookOpen, BarChart2, GraduationCap,
  FileText, Settings, LogOut, ChevronDown,
} from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import Image from "next/image";

const font = "'Plus Jakarta Sans', -apple-system, sans-serif";

const navItems = [
  { href: "/dashboard", label: "Página inicial", icon: LayoutDashboard },
  { href: "/linear", label: "Linear", icon: CheckSquare },
  { href: "/slack", label: "Slack", icon: MessageSquare },
  { href: "/agenda", label: "Agenda", icon: Calendar },
  { href: "/email", label: "Email", icon: Mail },
  { href: "/analytics", label: "Analytics", icon: BarChart2 },
  { href: "/loja", label: "Loja", icon: ShoppingBag },
  { href: "/drive", label: "Drive", icon: HardDrive },
  { href: "/marca", label: "Design System", icon: BookOpen, isNew: true },
];

const bottomItems = [
  { href: "/tutoriais", label: "Tutoriais", icon: GraduationCap },
  { href: "/docs", label: "Documentação", icon: FileText },
  { href: "/conta", label: "Minha conta", icon: Settings },
];

function NavItem({ href, label, icon: Icon, active, isNew }: {
  href: string; label: string;
  icon: React.ComponentType<{ size?: number }>;
  active: boolean; isNew?: boolean;
}) {
  return (
    <Link
      href={href}
      style={{
        display: "flex", alignItems: "center", gap: 9,
        padding: "7px 10px", borderRadius: 10, marginBottom: 1,
        textDecoration: "none", fontFamily: font, fontSize: 13,
        transition: "all 0.16s cubic-bezier(0.4, 0, 0.2, 1)",
        background: active ? "var(--bg-active)" : "transparent",
        backdropFilter: active ? "blur(12px) saturate(160%)" : "none",
        WebkitBackdropFilter: active ? "blur(12px) saturate(160%)" : "none",
        border: "1px solid",
        borderLeftWidth: "2px",
        borderColor: active ? "var(--glass-border)" : "transparent",
        borderLeftColor: active ? "var(--mk-purple)" : "transparent",
        color: active ? "var(--text-primary)" : "var(--text-secondary)",
        fontWeight: active ? 600 : 400,
        boxShadow: active ? "inset 0 0 16px var(--mk-purple-glow)" : "none",
      }}
      onMouseEnter={(e) => {
        if (active) return;
        const el = e.currentTarget as HTMLElement;
        el.style.background = "var(--bg-card)";
        el.style.backdropFilter = "blur(8px) saturate(140%)";
        (el.style as unknown as Record<string, string>).WebkitBackdropFilter = "blur(8px) saturate(140%)";
        el.style.borderColor = "var(--border-card)";
        el.style.color = "var(--text-primary)";
      }}
      onMouseLeave={(e) => {
        if (active) return;
        const el = e.currentTarget as HTMLElement;
        el.style.background = "transparent";
        el.style.backdropFilter = "none";
        (el.style as unknown as Record<string, string>).WebkitBackdropFilter = "none";
        el.style.borderColor = "transparent";
        el.style.color = "var(--text-secondary)";
      }}
    >
      <Icon size={15} />
      <span style={{ flex: 1 }}>{label}</span>
      {isNew && (
        <span style={{
          background: "var(--mk-green)", color: "#000",
          fontFamily: font, fontWeight: 700, fontSize: 8,
          padding: "2px 6px", borderRadius: 20,
          boxShadow: "0 0 8px var(--mk-green-glow)",
        }}>
          NEW
        </span>
      )}
    </Link>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <aside style={{
      background: "var(--bg-sidebar)",
      borderRight: "1px solid var(--border)",
      width: 220, flexShrink: 0,
      display: "flex", flexDirection: "column",
      height: "100%", overflowY: "auto",
      transition: "background 0.22s ease, border-color 0.22s ease",
    }}>

      {/* Workspace selector */}
      <div style={{ padding: "12px 10px 8px", borderBottom: "1px solid var(--border)" }}>
        <div
          style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", borderRadius: 10, cursor: "pointer", transition: "background 0.15s" }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--bg-card)"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
        >
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: "linear-gradient(135deg, var(--mk-purple) 0%, var(--mk-magenta) 100%)",
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            boxShadow: "0 2px 10px var(--mk-purple-glow)",
          }}>
            <span style={{ color: "#fff", fontWeight: 700, fontSize: 12, fontFamily: font }}>mK</span>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontFamily: font, fontWeight: 600, fontSize: 13, color: "var(--text-primary)", lineHeight: "16px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              Metakosmos Studio
            </p>
            <p style={{ fontFamily: font, fontWeight: 400, fontSize: 10, color: "var(--text-muted)", lineHeight: "14px" }}>
              Owner · Organização ativa
            </p>
          </div>
          <ChevronDown size={12} color="var(--text-muted)" />
        </div>
      </div>

      {/* Main nav */}
      <nav style={{ padding: "8px 10px", flex: 1 }}>
        {navItems.map(({ href, label, icon, isNew }) => (
          <NavItem key={href} href={href} label={label} icon={icon} active={pathname === href} isNew={isNew} />
        ))}
      </nav>

      {/* Bottom nav */}
      <div style={{ borderTop: "1px solid var(--border)", padding: "8px 10px" }}>
        {bottomItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href} href={href}
            style={{
              display: "flex", alignItems: "center", gap: 9,
              padding: "7px 10px", borderRadius: 10, marginBottom: 1,
              color: "var(--text-secondary)", textDecoration: "none",
              fontFamily: font, fontWeight: 400, fontSize: 13,
              border: "1px solid transparent", transition: "all 0.16s",
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLElement;
              el.style.background = "var(--bg-card)";
              el.style.borderColor = "var(--border-card)";
              el.style.color = "var(--text-primary)";
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLElement;
              el.style.background = "transparent";
              el.style.borderColor = "transparent";
              el.style.color = "var(--text-secondary)";
            }}
          >
            <Icon size={15} />
            {label}
          </Link>
        ))}
      </div>

      {/* User profile */}
      <div style={{ borderTop: "1px solid var(--border)", padding: "10px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 10px", marginBottom: 2 }}>
          {session?.user?.image ? (
            <Image src={session.user.image} alt={session.user.name ?? ""} width={30} height={30}
              style={{ borderRadius: "50%", flexShrink: 0, border: "1px solid var(--border-card)" }} />
          ) : (
            <div style={{
              width: 30, height: 30, borderRadius: "50%",
              background: "linear-gradient(135deg, var(--mk-purple), var(--mk-blue))",
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}>
              <span style={{ color: "#fff", fontWeight: 700, fontSize: 12, fontFamily: font }}>
                {session?.user?.name?.[0] ?? "U"}
              </span>
            </div>
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontFamily: font, fontWeight: 600, fontSize: 12, color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {session?.user?.name ?? "Usuário"}
            </p>
            <p style={{ fontFamily: font, fontWeight: 400, fontSize: 10, color: "var(--text-muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {session?.user?.email ?? ""}
            </p>
          </div>
        </div>

        <button
          onClick={() => signOut()}
          style={{
            display: "flex", alignItems: "center", gap: 9,
            padding: "7px 10px", borderRadius: 10, width: "100%",
            background: "transparent", border: "1px solid transparent",
            cursor: "pointer", color: "var(--text-secondary)",
            fontFamily: font, fontWeight: 400, fontSize: 13, textAlign: "left",
            transition: "all 0.16s",
          }}
          onMouseEnter={(e) => {
            const el = e.currentTarget as HTMLElement;
            el.style.background = "rgba(229, 19, 142, 0.08)";
            el.style.borderColor = "rgba(229, 19, 142, 0.20)";
            el.style.color = "var(--mk-magenta)";
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget as HTMLElement;
            el.style.background = "transparent";
            el.style.borderColor = "transparent";
            el.style.color = "var(--text-secondary)";
          }}
        >
          <LogOut size={15} />
          Sair
        </button>
      </div>
    </aside>
  );
}