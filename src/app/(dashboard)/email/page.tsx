import { Header } from "@/components/layout/Header";
import { Mail, Star, Inbox } from "lucide-react";

export default function EmailPage() {
  return (
    <div className="flex flex-col flex-1">
      <Header title="Email" subtitle="Gmail" />
      <div className="flex-1 p-6 space-y-4">
        <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-center">
          <Mail size={32} className="text-violet-400 mx-auto mb-3" />
          <p className="text-white/40 text-sm">
            Faça login com Google para acessar seus emails diretamente aqui.
          </p>
          <button className="mt-4 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-sm rounded-lg transition-colors">
            Conectar Gmail
          </button>
        </div>

        {/* Pastas placeholder */}
        <div className="space-y-2">
          {[
            { label: "Caixa de entrada", icon: Inbox, count: 0 },
            { label: "Favoritos", icon: Star, count: 0 },
          ].map(({ label, icon: Icon, count }) => (
            <div
              key={label}
              className="flex items-center justify-between px-4 py-3 bg-white/5 border border-white/10 rounded-xl"
            >
              <div className="flex items-center gap-3 text-white/40">
                <Icon size={14} />
                <span className="text-sm">{label}</span>
              </div>
              <span className="text-white/20 text-xs">{count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
