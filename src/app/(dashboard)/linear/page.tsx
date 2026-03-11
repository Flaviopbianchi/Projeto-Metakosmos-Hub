import { Header } from "@/components/layout/Header";
import { CheckSquare, Flag, Layers, Milestone } from "lucide-react";

const sections = [
  { label: "Tasks", icon: CheckSquare, count: 0 },
  { label: "Projetos", icon: Layers, count: 0 },
  { label: "Iniciativas", icon: Flag, count: 0 },
  { label: "Milestones", icon: Milestone, count: 0 },
];

export default function LinearPage() {
  return (
    <div className="flex flex-col flex-1">
      <Header title="Linear" subtitle="Tasks, Projetos, Iniciativas e Milestones" />
      <div className="flex-1 p-6 space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {sections.map(({ label, icon: Icon, count }) => (
            <div
              key={label}
              className="bg-white/5 border border-white/10 rounded-xl p-5"
            >
              <div className="flex items-center gap-2 mb-3">
                <Icon size={16} className="text-violet-400" />
                <span className="text-white/50 text-xs">{label}</span>
              </div>
              <p className="text-white text-2xl font-semibold">{count}</p>
            </div>
          ))}
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-center">
          <p className="text-white/40 text-sm">
            Configure sua chave de API do Linear em{" "}
            <code className="text-violet-400">.env.local</code> para carregar
            seus dados automaticamente.
          </p>
          <code className="block mt-3 text-xs text-white/30 bg-black/30 rounded-lg px-4 py-2">
            LINEAR_API_KEY=lin_api_...
          </code>
        </div>
      </div>
    </div>
  );
}
