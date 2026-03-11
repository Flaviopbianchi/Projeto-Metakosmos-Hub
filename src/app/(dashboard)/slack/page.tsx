import { Header } from "@/components/layout/Header";
import { MessageSquare, Hash } from "lucide-react";

export default function SlackPage() {
  return (
    <div className="flex flex-col flex-1">
      <Header title="Slack" subtitle="Conversas e canais da equipe" />
      <div className="flex-1 p-6 space-y-4">
        <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-center">
          <MessageSquare size={32} className="text-violet-400 mx-auto mb-3" />
          <p className="text-white/40 text-sm">
            Configure sua integração Slack em{" "}
            <code className="text-violet-400">.env.local</code> para visualizar
            seus canais e mensagens aqui.
          </p>
          <code className="block mt-3 text-xs text-white/30 bg-black/30 rounded-lg px-4 py-2">
            SLACK_TOKEN=xoxb-...
          </code>
        </div>

        {/* Canais placeholder */}
        <div className="space-y-2">
          {["geral", "produto", "design", "dev"].map((canal) => (
            <div
              key={canal}
              className="flex items-center gap-3 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white/40"
            >
              <Hash size={14} />
              <span className="text-sm">{canal}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
