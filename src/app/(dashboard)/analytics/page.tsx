import { Header } from "@/components/layout/Header";
import { BarChart2, Users, Eye, MousePointer } from "lucide-react";

const metrics = [
  { label: "Visitantes únicos", icon: Users, value: "—" },
  { label: "Pageviews", icon: Eye, value: "—" },
  { label: "Cliques", icon: MousePointer, value: "—" },
];

export default function AnalyticsPage() {
  return (
    <div className="flex flex-col flex-1">
      <Header title="Analytics" subtitle="Microsoft Clarity" />
      <div className="flex-1 p-6 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {metrics.map(({ label, icon: Icon, value }) => (
            <div
              key={label}
              className="bg-white/5 border border-white/10 rounded-xl p-5"
            >
              <div className="flex items-center gap-2 mb-3">
                <Icon size={16} className="text-violet-400" />
                <span className="text-white/50 text-xs">{label}</span>
              </div>
              <p className="text-white text-2xl font-semibold">{value}</p>
            </div>
          ))}
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-center">
          <BarChart2 size={32} className="text-violet-400 mx-auto mb-3" />
          <p className="text-white/40 text-sm">
            Configure sua chave do Microsoft Clarity em{" "}
            <code className="text-violet-400">.env.local</code> para ver os
            dados de analytics.
          </p>
          <code className="block mt-3 text-xs text-white/30 bg-black/30 rounded-lg px-4 py-2">
            CLARITY_PROJECT_ID=...
          </code>
        </div>
      </div>
    </div>
  );
}
