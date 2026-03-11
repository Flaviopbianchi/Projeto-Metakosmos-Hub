import { Header } from "@/components/layout/Header";
import { Calendar } from "lucide-react";

const days = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const today = new Date();

export default function AgendaPage() {
  return (
    <div className="flex flex-col flex-1">
      <Header title="Agenda" subtitle="Google Calendar" />
      <div className="flex-1 p-6 space-y-4">
        <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-center">
          <Calendar size={32} className="text-violet-400 mx-auto mb-3" />
          <p className="text-white/40 text-sm">
            Faça login com Google para sincronizar sua agenda automaticamente.
          </p>
          <button className="mt-4 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-sm rounded-lg transition-colors">
            Conectar Google Calendar
          </button>
        </div>

        {/* Mini calendário visual */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-5">
          <div className="flex justify-between items-center mb-4">
            <span className="text-white font-medium">
              {today.toLocaleString("pt-BR", { month: "long", year: "numeric" })}
            </span>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center">
            {days.map((d) => (
              <div key={d} className="text-white/30 text-xs py-1">
                {d}
              </div>
            ))}
            {Array.from({ length: 35 }, (_, i) => (
              <div
                key={i}
                className="text-white/20 text-xs py-1 rounded hover:bg-white/10 cursor-default"
              >
                {i + 1 <= 31 ? i + 1 : ""}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
