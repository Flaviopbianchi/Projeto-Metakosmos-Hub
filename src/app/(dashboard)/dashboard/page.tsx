import { Header } from "@/components/layout/Header";
import {
  CheckSquare,
  MessageSquare,
  Calendar,
  Mail,
  BarChart2,
  Star,
  Zap,
} from "lucide-react";

const stats = [
  { label: "Tasks abertas", value: "—", icon: CheckSquare },
  { label: "Mensagens Slack", value: "—", icon: MessageSquare },
  { label: "Eventos hoje", value: "—", icon: Calendar },
  { label: "Emails não lidos", value: "—", icon: Mail },
];

const quickLinks = [
  { label: "Linear", href: "/linear", icon: CheckSquare },
  { label: "Slack", href: "/slack", icon: MessageSquare },
  { label: "Agenda", href: "/agenda", icon: Calendar },
  { label: "Analytics", href: "/analytics", icon: BarChart2 },
];

export default function DashboardPage() {
  return (
    <div className="flex flex-col flex-1">
      <Header title="Dashboard" subtitle="Bem-vindo ao Metakosmos Hub" />

      <div className="flex-1 p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map(({ label, value, icon: Icon }) => (
            <div key={label} className="bg-white/5 border border-white/10 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Icon size={16} className="text-violet-400" />
                <span className="text-white/50 text-xs">{label}</span>
              </div>
              <p className="text-white text-2xl font-semibold">{value}</p>
            </div>
          ))}
        </div>

        {/* Destaques do mês */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 border border-amber-500/20 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Star size={18} className="text-amber-400" />
              <span className="text-amber-400 font-semibold text-sm">Golden Pizza do mês</span>
            </div>
            <p className="text-white/40 text-sm">Nenhuma indicação este mês ainda.</p>
          </div>

          <div className="bg-gradient-to-br from-violet-500/10 to-indigo-600/5 border border-violet-500/20 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Zap size={18} className="text-violet-400" />
              <span className="text-violet-400 font-semibold text-sm">WooW do mês</span>
            </div>
            <p className="text-white/40 text-sm">Nenhum destaque este mês ainda.</p>
          </div>
        </div>

        {/* Acesso rápido */}
        <div>
          <h2 className="text-white/50 text-xs uppercase tracking-wider mb-3">Acesso rápido</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {quickLinks.map(({ label, href, icon: Icon }) => (
              <a
                key={href}
                href={href}
                className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col items-center gap-2 hover:bg-white/10 transition-colors"
              >
                <Icon size={20} className="text-violet-400" />
                <span className="text-white/70 text-sm">{label}</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
