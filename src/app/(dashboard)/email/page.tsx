"use client";

import { useEffect, useState } from "react";
import { useSession, signIn } from "next-auth/react";
import { Header } from "@/components/layout/Header";
import { Mail, AlertCircle } from "lucide-react";

type EmailMessage = {
  id: string | null | undefined;
  subject: string;
  from: string;
  date: string;
  snippet: string;
};

function parseFrom(from: string) {
  const match = from.match(/^"?([^"<]+)"?\s*<?[^>]*>?$/);
  return match ? match[1].trim() : from;
}

export default function EmailPage() {
  const { data: session, status } = useSession();
  const [messages, setMessages] = useState<EmailMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status !== "authenticated") return;
    setLoading(true);
    fetch("/api/google/gmail")
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setError(d.error);
        else setMessages(d.messages);
      })
      .catch(() => setError("Falha ao buscar emails"))
      .finally(() => setLoading(false));
  }, [status]);

  return (
    <div className="flex flex-col flex-1">
      <Header title="Email" subtitle={`Gmail — não lidos${messages.length ? ` (${messages.length})` : ""}`} />
      <div className="flex-1 p-6 space-y-3">

        {status === "unauthenticated" && (
          <div className="bg-white/5 border border-white/10 rounded-xl p-8 flex flex-col items-center gap-4">
            <Mail size={32} className="text-violet-400" />
            <p className="text-white/40 text-sm">Faça login com Google para ver seus emails.</p>
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
            {[1, 2, 3, 4].map((i) => <div key={i} className="h-16 bg-white/5 rounded-xl animate-pulse" />)}
          </div>
        )}

        {!loading && status === "authenticated" && messages.length === 0 && !error && (
          <p className="text-white/30 text-sm text-center py-8">Nenhum email não lido.</p>
        )}

        {!loading && messages.map((msg) => (
          <div
            key={msg.id}
            className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl hover:border-violet-500/40 transition-colors"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-white/80 text-sm font-medium truncate">{msg.subject}</p>
                <p className="text-white/40 text-xs mt-0.5">{parseFrom(msg.from)}</p>
                {msg.snippet && (
                  <p className="text-white/25 text-xs mt-1 line-clamp-1">{msg.snippet}</p>
                )}
              </div>
              <span className="text-white/20 text-xs shrink-0 mt-0.5">
                {new Date(msg.date).toLocaleDateString("pt-BR", { day: "numeric", month: "short" })}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
