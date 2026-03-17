"use client";

import { Search, LogIn, Sun, Moon, ChevronDown, ChevronUp } from "lucide-react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useTheme } from "@/components/ThemeProvider";
import { useEffect, useState } from "react";

interface HeaderProps {
  title: string;
  subtitle?: string;
}

const font = "'Plus Jakarta Sans', -apple-system, sans-serif";
const mono = "'JetBrains Mono', 'Courier New', 'SF Mono', monospace";

function pad(n: number) {
  return String(n).padStart(2, "0");
}

// ─── Digital Clock ────────────────────────────────────────────────────────────

function DigitalClock() {
  const [now, setNow] = useState<Date | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [hovered, setHovered] = useState(false);

  // Hydration-safe: only set time on client
  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  if (!now) return null;

  const hh = pad(now.getHours());
  const mm = pad(now.getMinutes());
  const ss = pad(now.getSeconds());

  const dateStr = now.toLocaleDateString("pt-BR", {
    weekday: "long", day: "numeric", month: "short",
  });

  return (
    <button
      onClick={() => setExpanded((v) => !v)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      title={expanded ? "Recolher relógio" : "Expandir relógio"}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 2,
        background: hovered ? "var(--bg-card-hover)" : "var(--bg-input)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        border: `1px solid ${hovered ? "var(--mk-purple)" : "var(--border-card)"}`,
        borderRadius: 10,
        padding: expanded ? "7px 16px" : "5px 12px",
        cursor: "pointer",
        transition: "all 0.25s cubic-bezier(0.22, 1, 0.36, 1)",
        minWidth: expanded ? 148 : 88,
        boxShadow: hovered
          ? "0 0 14px var(--mk-purple-glow)"
          : "none",
        outline: "none",
        userSelect: "none",
        position: "relative",
      }}
    >
      {/* ── Main time row ── */}
      <div style={{
        display: "flex",
        alignItems: "baseline",
        gap: 0,
        fontFamily: mono,
        fontVariantNumeric: "tabular-nums",
        letterSpacing: "0.04em",
        lineHeight: 1,
      }}>
        {/* HH */}
        <span style={{
          fontSize: expanded ? 22 : 17,
          fontWeight: 700,
          color: "var(--text-primary)",
          transition: "font-size 0.25s cubic-bezier(0.22, 1, 0.36, 1)",
        }}>
          {hh}
        </span>

        {/* Colon 1 */}
        <span
          className="clock-colon"
          style={{
            fontSize: expanded ? 20 : 15,
            fontWeight: 700,
            color: "var(--mk-purple)",
            margin: "0 1px",
            transition: "font-size 0.25s cubic-bezier(0.22, 1, 0.36, 1)",
          }}
        >
          :
        </span>

        {/* MM */}
        <span style={{
          fontSize: expanded ? 22 : 17,
          fontWeight: 700,
          color: "var(--text-primary)",
          transition: "font-size 0.25s cubic-bezier(0.22, 1, 0.36, 1)",
        }}>
          {mm}
        </span>

        {/* Seconds — only when expanded */}
        {expanded && (
          <>
            <span
              className="clock-colon"
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: "var(--mk-purple)",
                margin: "0 1px",
              }}
            >
              :
            </span>
            {/* key={ss} re-mounts every second → re-triggers the animation */}
            <span
              key={ss}
              className="clock-second"
              style={{
                fontSize: 15,
                fontWeight: 700,
                color: "var(--mk-green)",
              }}
            >
              {ss}
            </span>
          </>
        )}

        {/* Chevron indicator */}
        <span style={{
          marginLeft: 5,
          color: "var(--text-muted)",
          display: "flex",
          alignItems: "center",
          alignSelf: "center",
          opacity: hovered ? 1 : 0.4,
          transition: "opacity 0.15s",
        }}>
          {expanded
            ? <ChevronUp size={10} />
            : <ChevronDown size={10} />
          }
        </span>
      </div>

      {/* ── Date row — only when expanded ── */}
      {expanded && (
        <div
          className="clock-date-in"
          style={{
            fontFamily: font,
            fontSize: 10,
            fontWeight: 500,
            color: "var(--text-muted)",
            letterSpacing: "0.06em",
            textTransform: "capitalize",
            whiteSpace: "nowrap",
          }}
        >
          {dateStr}
        </div>
      )}
    </button>
  );
}

// ─── Header ───────────────────────────────────────────────────────────────────

export function Header({ title, subtitle }: HeaderProps) {
  const { data: session, status } = useSession();
  const { theme, toggle } = useTheme();

  return (
    <header
      style={{
        background: "var(--bg-header)",
        backdropFilter: "saturate(180%) blur(20px)",
        WebkitBackdropFilter: "saturate(180%) blur(20px)",
        borderBottom: "1px solid var(--border)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 24px",
        height: 52,
        flexShrink: 0,
        transition: "background 0.22s ease, border-color 0.22s ease",
      }}
    >
      {/* Left: search */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          background: "var(--bg-input)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          border: "1px solid var(--border-card)",
          borderRadius: 10,
          padding: "7px 12px",
          width: 220,
          cursor: "text",
          transition: "border-color 0.15s, box-shadow 0.15s",
        }}
        onMouseEnter={(e) => {
          const el = e.currentTarget as HTMLElement;
          el.style.borderColor = "var(--border-hover)";
          el.style.boxShadow = "0 0 0 3px var(--mk-purple-glow)";
        }}
        onMouseLeave={(e) => {
          const el = e.currentTarget as HTMLElement;
          el.style.borderColor = "var(--border-card)";
          el.style.boxShadow = "none";
        }}
      >
        <Search size={13} color="var(--text-muted)" />
        <span style={{ fontFamily: font, fontSize: 13, color: "var(--text-placeholder)", fontWeight: 400 }}>
          Pesquisar
        </span>
      </div>

      {/* Center: Digital Clock */}
      <DigitalClock />

      {/* Right section */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {subtitle && (
          <p style={{ fontFamily: font, fontWeight: 400, fontSize: 12, color: "var(--text-muted)" }}>
            {subtitle}
          </p>
        )}

        {/* Theme toggle */}
        <button
          onClick={toggle}
          aria-label={theme === "dark" ? "Mudar para tema claro" : "Mudar para tema escuro"}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 32,
            height: 32,
            borderRadius: 8,
            background: "var(--bg-input)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            border: "1px solid var(--border-card)",
            cursor: "pointer",
            color: "var(--text-secondary)",
            transition: "all 0.18s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
          onMouseEnter={(e) => {
            const el = e.currentTarget as HTMLElement;
            el.style.background = "var(--bg-card-hover)";
            el.style.borderColor = "var(--mk-purple)";
            el.style.color = "var(--mk-purple)";
            el.style.boxShadow = "0 0 12px var(--mk-purple-glow)";
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget as HTMLElement;
            el.style.background = "var(--bg-input)";
            el.style.borderColor = "var(--border-card)";
            el.style.color = "var(--text-secondary)";
            el.style.boxShadow = "none";
          }}
        >
          {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
        </button>

        {/* User */}
        {status === "authenticated" && session?.user ? (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontFamily: font, fontWeight: 500, fontSize: 13, color: "var(--text-secondary)" }}>
              {session.user.name?.split(" ")[0]}
            </span>
            {session.user.image ? (
              <Image
                src={session.user.image}
                alt={session.user.name ?? ""}
                width={28}
                height={28}
                style={{ borderRadius: "50%", border: "1px solid var(--border-card)" }}
              />
            ) : (
              <div style={{
                width: 28, height: 28, borderRadius: "50%",
                background: "linear-gradient(135deg, var(--mk-purple), var(--mk-blue))",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <span style={{ color: "#fff", fontWeight: 700, fontSize: 11, fontFamily: font }}>
                  {session.user.name?.[0] ?? "U"}
                </span>
              </div>
            )}
          </div>
        ) : (
          <a
            href="/login"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "7px 16px",
              borderRadius: 10,
              background: "var(--mk-purple)",
              color: "#ffffff",
              fontFamily: font,
              fontWeight: 600,
              fontSize: 13,
              textDecoration: "none",
              cursor: "pointer",
              boxShadow: "0 2px 12px var(--mk-purple-glow)",
              transition: "all 0.18s",
            }}
          >
            <LogIn size={13} />
            Entrar
          </a>
        )}
      </div>
    </header>
  );
}
