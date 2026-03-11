"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/layout/Header";
import { Hash, Lock, Users, MessageSquare, AlertCircle, Clock } from "lucide-react";
import { clsx } from "clsx";

type Channel = {
  id: string;
  name: string;
  isPrivate: boolean;
  members: number;
};

type Message = {
  ts: string;
  text: string;
  user: string | null;
  isBot: boolean;
  date: string;
};

function formatTime(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "agora";
  if (diffMin < 60) return `${diffMin}m atrás`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH}h atrás`;
  return date.toLocaleDateString("pt-BR", { day: "numeric", month: "short" });
}

function renderText(text: string) {
  return text.replace(/<[^>]+>/g, "").trim();
}

export default function SlackPage() {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [selected, setSelected] = useState<Channel | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingChannels, setLoadingChannels] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/slack/channels")
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setError(d.error);
        else {
          setChannels(d.channels);
          if (d.channels.length > 0) setSelected(d.channels[0]);
        }
      })
      .catch(() => setError("Falha ao conectar com o Slack"))
      .finally(() => setLoadingChannels(false));
  }, []);

  useEffect(() => {
    if (!selected) return;
    setLoadingMessages(true);
    setMessages([]);
    fetch(`/api/slack/messages?channel=${selected.id}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setError(d.error);
        else setMessages(d.messages);
      })
      .catch(() => setError("Falha ao carregar mensagens"))
      .finally(() => setLoadingMessages(false));
  }, [selected]);

  return (
    <div className="flex flex-col flex-1">
      <Header title="Slack" subtitle="Canais e mensagens da equipe" />

      {error && (
        <div className="mx-6 mt-4 flex items-center gap-3 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
          <AlertCircle size={16} className="text-red-400 shrink-0" />
          <div>
            <p className="text-red-300 text-sm">{error}</p>
            {error.includes("SLACK_TOKEN") && (
              <p className="text-red-400/60 text-xs mt-0.5">
                Adicione <code className="bg-black/30 px-1 rounded">SLACK_TOKEN=xoxb-...</code> no <code className="bg-black/30 px-1 rounded">.env.local</code>
              </p>
            )}
          </div>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar de canais */}
        <div className="w-56 border-r border-white/10 flex flex-col py-4 overflow-y-auto shrink-0">
          <p className="text-white/30 text-xs uppercase tracking-wider px-4 mb-2">Canais</p>

          {loadingChannels && (
            <div className="space-y-2 px-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-8 bg-white/5 rounded-lg animate-pulse" />
              ))}
            </div>
          )}

          {channels.map((ch) => (
            <button
              key={ch.id}
              onClick={() => setSelected(ch)}
              className={clsx(
                "flex items-center gap-2 px-4 py-2 text-sm w-full text-left transition-colors",
                selected?.id === ch.id
                  ? "bg-violet-600/20 text-violet-400"
                  : "text-white/50 hover:text-white hover:bg-white/5"
              )}
            >
              {ch.isPrivate ? <Lock size={12} /> : <Hash size={12} />}
              <span className="truncate">{ch.name}</span>
              <span className="ml-auto flex items-center gap-0.5 text-white/20 text-xs">
                <Users size={10} />
                {ch.members}
              </span>
            </button>
          ))}
        </div>

        {/* Mensagens */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {selected && (
            <div className="px-4 py-3 border-b border-white/10 flex items-center gap-2">
              {selected.isPrivate ? (
                <Lock size={14} className="text-white/40" />
              ) : (
                <Hash size={14} className="text-white/40" />
              )}
              <span className="text-white font-medium text-sm">{selected.name}</span>
            </div>
          )}

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {loadingMessages && (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-14 bg-white/5 rounded-xl animate-pulse" />
                ))}
              </div>
            )}

            {!loadingMessages && messages.length === 0 && selected && (
              <div className="flex flex-col items-center justify-center h-40 gap-2">
                <MessageSquare size={24} className="text-white/20" />
                <p className="text-white/30 text-sm">Nenhuma mensagem recente.</p>
              </div>
            )}

            {!loadingMessages && messages.map((msg) => (
              <div key={msg.ts} className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-violet-600/30 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-violet-300 text-xs font-bold">
                    {msg.isBot ? "B" : (msg.user?.[0] ?? "?")}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-white/70 text-xs font-medium">
                      {msg.isBot ? "Bot" : (msg.user ?? "Usuário")}
                    </span>
                    <span className="flex items-center gap-1 text-white/20 text-xs">
                      <Clock size={10} />
                      {formatTime(msg.date)}
                    </span>
                  </div>
                  <p className="text-white/60 text-sm mt-0.5 break-words">
                    {renderText(msg.text)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
