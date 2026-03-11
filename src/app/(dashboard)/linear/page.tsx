"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/layout/Header";
import { CheckSquare, Flag, Layers, Milestone, ExternalLink, AlertCircle } from "lucide-react";
import { clsx } from "clsx";

type Issue = {
  id: string;
  title: string;
  priority: number;
  identifier: string;
  url: string;
};

type Project = {
  id: string;
  name: string;
  state: string;
  url: string;
  progress: number;
};

type Initiative = {
  id: string;
  name: string;
  description: string | null;
};

type MilestoneItem = {
  id: string;
  name: string;
  targetDate: string | null;
  projectName: string;
};

type LinearData = {
  issues: Issue[];
  projects: Project[];
  initiatives: Initiative[];
  milestones: MilestoneItem[];
};

const priorityLabel: Record<number, { label: string; color: string }> = {
  0: { label: "Sem prioridade", color: "text-white/30" },
  1: { label: "Urgente", color: "text-red-400" },
  2: { label: "Alta", color: "text-orange-400" },
  3: { label: "Média", color: "text-yellow-400" },
  4: { label: "Baixa", color: "text-white/40" },
};

type Tab = "issues" | "projects" | "initiatives" | "milestones";

export default function LinearPage() {
  const [data, setData] = useState<LinearData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("issues");

  useEffect(() => {
    fetch("/api/linear")
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setError(d.error);
        else setData(d);
      })
      .catch(() => setError("Falha ao conectar com a API"))
      .finally(() => setLoading(false));
  }, []);

  const tabs: { key: Tab; label: string; icon: typeof CheckSquare; count?: number }[] = [
    { key: "issues", label: "Tasks", icon: CheckSquare, count: data?.issues.length },
    { key: "projects", label: "Projetos", icon: Layers, count: data?.projects.length },
    { key: "initiatives", label: "Iniciativas", icon: Flag, count: data?.initiatives.length },
    { key: "milestones", label: "Milestones", icon: Milestone, count: data?.milestones.length },
  ];

  return (
    <div className="flex flex-col flex-1">
      <Header title="Linear" subtitle="Tasks, Projetos, Iniciativas e Milestones" />

      <div className="flex-1 p-6 space-y-4">
        {/* Tabs */}
        <div className="flex gap-2 border-b border-white/10 pb-1">
          {tabs.map(({ key, label, icon: Icon, count }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={clsx(
                "flex items-center gap-2 px-4 py-2 text-sm transition-colors",
                tab === key
                  ? "text-violet-400 border-b-2 border-violet-400"
                  : "text-white/40 hover:text-white"
              )}
            >
              <Icon size={14} />
              {label}
              {count !== undefined && (
                <span className="text-xs bg-white/10 px-1.5 py-0.5 rounded-full">
                  {count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
            <AlertCircle size={16} className="text-red-400 shrink-0" />
            <div>
              <p className="text-red-300 text-sm">{error}</p>
              {error.includes("LINEAR_API_KEY") || error.includes("not set") ? (
                <p className="text-red-400/60 text-xs mt-1">
                  Adicione <code className="bg-black/30 px-1 rounded">LINEAR_API_KEY=lin_api_...</code> no arquivo <code className="bg-black/30 px-1 rounded">.env.local</code>
                </p>
              ) : null}
            </div>
          </div>
        )}

        {/* Loading skeleton */}
        {loading && (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-14 bg-white/5 rounded-xl animate-pulse" />
            ))}
          </div>
        )}

        {/* Issues */}
        {!loading && tab === "issues" && data && (
          <div className="space-y-2">
            {data.issues.length === 0 && (
              <p className="text-white/30 text-sm text-center py-8">Nenhuma task atribuída a você.</p>
            )}
            {data.issues.map((issue) => (
              <a
                key={issue.id}
                href={issue.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between px-4 py-3 bg-white/5 border border-white/10 rounded-xl hover:border-violet-500/40 transition-colors group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-white/30 text-xs shrink-0 font-mono">{issue.identifier}</span>
                  <span className="text-white/80 text-sm truncate">{issue.title}</span>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className={clsx("text-xs", priorityLabel[issue.priority]?.color)}>
                    {priorityLabel[issue.priority]?.label}
                  </span>
                  <ExternalLink size={12} className="text-white/20 group-hover:text-white/50 transition-colors" />
                </div>
              </a>
            ))}
          </div>
        )}

        {/* Projects */}
        {!loading && tab === "projects" && data && (
          <div className="space-y-2">
            {data.projects.length === 0 && (
              <p className="text-white/30 text-sm text-center py-8">Nenhum projeto encontrado.</p>
            )}
            {data.projects.map((project) => (
              <a
                key={project.id}
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between px-4 py-3 bg-white/5 border border-white/10 rounded-xl hover:border-violet-500/40 transition-colors group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Layers size={14} className="text-violet-400 shrink-0" />
                  <span className="text-white/80 text-sm truncate">{project.name}</span>
                  <span className="text-white/20 text-xs shrink-0">{project.state}</span>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <div className="w-24 h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-violet-500 rounded-full"
                      style={{ width: `${Math.round((project.progress ?? 0) * 100)}%` }}
                    />
                  </div>
                  <span className="text-white/30 text-xs w-8 text-right">
                    {Math.round((project.progress ?? 0) * 100)}%
                  </span>
                  <ExternalLink size={12} className="text-white/20 group-hover:text-white/50 transition-colors" />
                </div>
              </a>
            ))}
          </div>
        )}

        {/* Initiatives */}
        {!loading && tab === "initiatives" && data && (
          <div className="space-y-2">
            {data.initiatives.length === 0 && (
              <p className="text-white/30 text-sm text-center py-8">Nenhuma iniciativa encontrada.</p>
            )}
            {data.initiatives.map((init) => (
              <div
                key={init.id}
                className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl"
              >
                <div className="flex items-center gap-3">
                  <Flag size={14} className="text-violet-400 shrink-0" />
                  <span className="text-white/80 text-sm">{init.name}</span>
                </div>
                {init.description && (
                  <p className="text-white/30 text-xs mt-1 ml-5 line-clamp-2">{init.description}</p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Milestones */}
        {!loading && tab === "milestones" && data && (
          <div className="space-y-2">
            {data.milestones.length === 0 && (
              <p className="text-white/30 text-sm text-center py-8">Nenhum milestone encontrado.</p>
            )}
            {data.milestones.map((m) => (
              <div
                key={m.id}
                className="flex items-center justify-between px-4 py-3 bg-white/5 border border-white/10 rounded-xl"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Milestone size={14} className="text-violet-400 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-white/80 text-sm truncate">{m.name}</p>
                    <p className="text-white/30 text-xs">{m.projectName}</p>
                  </div>
                </div>
                {m.targetDate && (
                  <span className="text-white/40 text-xs shrink-0">
                    {new Date(m.targetDate).toLocaleDateString("pt-BR")}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
