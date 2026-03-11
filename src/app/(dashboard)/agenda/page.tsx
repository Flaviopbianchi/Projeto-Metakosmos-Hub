"use client";

import { useEffect, useState } from "react";
import { useSession, signIn } from "next-auth/react";
import { Header } from "@/components/layout/Header";
import { Calendar, MapPin, ExternalLink, AlertCircle } from "lucide-react";

type CalendarEvent = {
  id: string | null | undefined;
  title: string;
  start: string | null;
  end: string | null;
  location: string | null;
  htmlLink: string | null;
  allDay: boolean;
};

function formatDate(dateStr: string | null, allDay: boolean) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  if (allDay) return date.toLocaleDateString("pt-BR", { weekday: "short", day: "numeric", month: "short" });
  return date.toLocaleString("pt-BR", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

export default function AgendaPage() {
  const { data: session, status } = useSession();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status !== "authenticated") return;
    setLoading(true);
    fetch("/api/google/calendar")
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setError(d.error);
        else setEvents(d.events);
      })
      .catch(() => setError("Falha ao buscar eventos"))
      .finally(() => setLoading(false));
  }, [status]);

  return (
    <div className="flex flex-col flex-1">
      <Header title="Agenda" subtitle="Google Calendar — próximos 7 dias" />
      <div className="flex-1 p-6 space-y-4">

        {status === "unauthenticated" && (
          <div className="bg-white/5 border border-white/10 rounded-xl p-8 flex flex-col items-center gap-4">
            <Calendar size={32} className="text-violet-400" />
            <p className="text-white/40 text-sm">Faça login com Google para ver sua agenda.</p>
            <button
              onClick={() => signIn("google")}
              className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-sm rounded-lg transition-colors"
            >
              Entrar com Google
            </button>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
            <AlertCircle size={16} className="text-red-400 shrink-0" />
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}

        {loading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <div key={i} className="h-16 bg-white/5 rounded-xl animate-pulse" />)}
          </div>
        )}

        {!loading && status === "authenticated" && events.length === 0 && !error && (
          <p className="text-white/30 text-sm text-center py-8">Nenhum evento nos próximos 7 dias.</p>
        )}

        {!loading && events.map((event) => (
          <a
            key={event.id}
            href={event.htmlLink ?? "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-start justify-between px-4 py-4 bg-white/5 border border-white/10 rounded-xl hover:border-violet-500/40 transition-colors group"
          >
            <div className="flex items-start gap-3 min-w-0">
              <div className="w-1 h-full min-h-[2rem] rounded-full bg-violet-500 shrink-0 mt-0.5" />
              <div className="min-w-0">
                <p className="text-white/80 text-sm font-medium truncate">{event.title}</p>
                <p className="text-white/40 text-xs mt-0.5">
                  {formatDate(event.start, event.allDay)}
                  {!event.allDay && event.end && ` → ${new Date(event.end).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`}
                </p>
                {event.location && (
                  <div className="flex items-center gap-1 mt-1">
                    <MapPin size={10} className="text-white/20" />
                    <span className="text-white/20 text-xs truncate">{event.location}</span>
                  </div>
                )}
              </div>
            </div>
            <ExternalLink size={12} className="text-white/20 group-hover:text-white/50 transition-colors mt-1 shrink-0" />
          </a>
        ))}
      </div>
    </div>
  );
}
