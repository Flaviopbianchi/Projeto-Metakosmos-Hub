"use client";

import { Header } from "@/components/layout/Header";
import {
  CheckSquare, MessageSquare, Calendar, Mail,
  BarChart2, Star, Zap,
} from "lucide-react";

const stats = [
  { label: "Tasks abertas",     value: "—", icon: CheckSquare,  color: "var(--mk-purple)",  glow: "var(--mk-purple-glow)"  },
  { label: "Mensagens Slack",   value: "—", icon: MessageSquare, color: "var(--mk-blue)",    glow: "var(--mk-blue-glow)"    },
  { label: "Eventos hoje",      value: "—", icon: Calendar,      color: "var(--mk-magenta)", glow: "var(--mk-magenta-glow)" },
  { label: "Emails não lidos",  value: "—", icon: Mail,          color: "var(--mk-green)",   glow: "var(--mk-green-glow)"   },
];

const quickLinks = [
  { label: "Linear",    href: "/linear",    icon: CheckSquare,   color: "var(--mk-purple)"  },
  { label: "Slack",     href: "/slack",     icon: MessageSquare, color: "var(--mk-blue)"    },
  { label: "Agenda",    href: "/agenda",    icon: Calendar,      color: "var(--mk-magenta)" },
  { label: "Analytics", href: "/analytics", icon: BarChart2,     color: "var(--mk-green)"   },
];

export default function HomePage() {
  return (
    <div className="flex flex-col flex-1">
      <Header title="Início" subtitle="Bem-vindo ao Metakosmos Hub" />

      <div style={{ flex: 1, padding: 24, overflowY: "auto", display: "flex", flexDirection: "column", gap: 24 }}>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12 }}>
          {stats.map(({ label, value, icon: Icon, color, glow }) => (
            <div
              key={label}
              style={{
                background: "var(--bg-card)",
                backdropFilter: "blur(12px) saturate(150%)",
                WebkitBackdropFilter: "blur(12px) saturate(150%)",
                border: "1px solid var(--border-card)",
                borderRadius: 14,
                padding: "18px 20px",
                transition: "all 0.18s",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: glow, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon size={14} color={color} />
                </div>
                <span style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 500 }}>{label}</span>
              </div>
              <p style={{ fontSize: 28, fontWeight: 700, color: "var(--text-primary)", lineHeight: 1 }}>{value}</p>
            </div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div style={{ background: "linear-gradient(135deg, rgba(255,69,0,0.12) 0%, rgba(255,222,0,0.06) 100%)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", border: "1px solid rgba(255,69,0,0.18)", borderRadius: 14, padding: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <Star size={18} color="var(--mk-orange)" />
              <span style={{ color: "var(--mk-orange)", fontWeight: 600, fontSize: 13 }}>Golden Pizza do mês</span>
            </div>
            <p style={{ color: "var(--text-muted)", fontSize: 13 }}>Nenhuma indicação este mês ainda.</p>
          </div>

          <div style={{ background: "linear-gradient(135deg, rgba(123,47,222,0.12) 0%, rgba(20,136,216,0.06) 100%)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", border: "1px solid rgba(123,47,222,0.18)", borderRadius: 14, padding: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <Zap size={18} color="var(--mk-purple)" />
              <span style={{ color: "var(--mk-purple)", fontWeight: 600, fontSize: 13, filter: "brightness(1.4)" }}>WooW do mês</span>
            </div>
            <p style={{ color: "var(--text-muted)", fontSize: 13 }}>Nenhum destaque este mês ainda.</p>
          </div>
        </div>

        <div>
          <p style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>
            Acesso rápido
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
            {quickLinks.map(({ label, href, icon: Icon, color }) => (
              <a key={href} href={href} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: "16px 12px", background: "var(--bg-card)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", border: "1px solid var(--border-card)", borderRadius: 12, textDecoration: "none", transition: "all 0.18s" }}>
                <Icon size={20} color={color} />
                <span style={{ fontSize: 12, color: "var(--text-secondary)", fontWeight: 500 }}>{label}</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
