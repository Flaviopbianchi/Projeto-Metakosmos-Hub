"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/layout/Header";
import { BarChart2, Users, Eye, MousePointer, RefreshCw, AlertTriangle } from "lucide-react";

interface ClarityMetrics {
  totalSessions?: number;
  totalPageviews?: number;
  totalClicks?: number;
  deadClickRate?: number;
  rageclickRate?: number;
  inp?: number;
  lcp?: number;
  cls?: number;
  clarityScore?: number;
}

export default function AnalyticsPage() {
  const [data, setData] = useState<ClarityMetrics | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function fetchMetrics() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/clarity/metrics");
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Erro desconhecido");
        return;
      }
      // Clarity API retorna array de métricas — normalizamos aqui
      setData(normalizeClarity(json));
    } catch {
      setError("Falha ao buscar métricas");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchMetrics(); }, []);

  return (
    <div className="flex flex-col flex-1">
      <Header title="Analytics" subtitle="Microsoft Clarity" />

      <div className="flex-1 p-6 space-y-6">

        {/* Toolbar */}
        <div className="flex justify-end">
          <button
            onClick={fetchMetrics}
            className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white transition px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10"
          >
            <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
            Atualizar
          </button>
        </div>

        {/* KPIs principais */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <KPICard
            icon={Users}
            label="Sessões (7 dias)"
            value={loading ? "…" : fmt(data?.totalSessions)}
          />
          <KPICard
            icon={Eye}
            label="Pageviews"
            value={loading ? "…" : fmt(data?.totalPageviews)}
          />
          <KPICard
            icon={MousePointer}
            label="Dead Click Rate"
            value={loading ? "…" : fmtPct(data?.deadClickRate)}
            alert={!loading && (data?.deadClickRate ?? 0) > 6}
            alertLabel="> 6% — atenção"
          />
        </div>

        {/* Core Web Vitals */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-3">
          <p className="text-white/50 text-xs uppercase tracking-widest">Core Web Vitals</p>
          <div className="grid grid-cols-3 gap-4">
            <VitalCard label="INP" value={loading ? "…" : fmtMs(data?.inp)} status={inpStatus(data?.inp)} />
            <VitalCard label="LCP" value={loading ? "…" : fmtMs(data?.lcp)} status={lcpStatus(data?.lcp)} />
            <VitalCard label="CLS" value={loading ? "…" : fmtCls(data?.cls)} status={clsStatus(data?.cls)} />
          </div>
        </div>

        {/* Error / not configured */}
        {error && (
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-5 flex gap-3 items-start">
            <AlertTriangle size={16} className="text-yellow-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-yellow-300 text-sm font-medium">{error}</p>
              {error.includes("CLARITY_PROJECT_ID") && (
                <p className="text-white/40 text-xs mt-1">
                  Acesse <span className="text-violet-400">clarity.microsoft.com</span> → seu projeto → Settings → copie o Project ID e cole em <code className="text-violet-400">.env.local</code>
                </p>
              )}
            </div>
          </div>
        )}

        {/* Clarity Score */}
        {!loading && !error && data?.clarityScore != null && (
          <div className="bg-white/5 border border-white/10 rounded-xl p-5 flex items-center justify-between">
            <div>
              <p className="text-white/50 text-xs uppercase tracking-widest mb-1">Score Clarity</p>
              <p className="text-white text-3xl font-semibold">{data.clarityScore.toFixed(1)}</p>
            </div>
            <BarChart2 size={32} className="text-violet-400" />
          </div>
        )}
      </div>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function KPICard({
  icon: Icon, label, value, alert, alertLabel,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  alert?: boolean;
  alertLabel?: string;
}) {
  return (
    <div className={`bg-white/5 border rounded-xl p-5 ${alert ? "border-yellow-500/40" : "border-white/10"}`}>
      <div className="flex items-center gap-2 mb-3">
        <Icon size={16} className={alert ? "text-yellow-400" : "text-violet-400"} />
        <span className="text-white/50 text-xs">{label}</span>
      </div>
      <p className="text-white text-2xl font-semibold">{value}</p>
      {alert && alertLabel && (
        <p className="text-yellow-400 text-xs mt-1">{alertLabel}</p>
      )}
    </div>
  );
}

function VitalCard({ label, value, status }: { label: string; value: string; status: "good" | "warn" | "bad" | "unknown" }) {
  const colors = {
    good: "text-green-400",
    warn: "text-yellow-400",
    bad: "text-red-400",
    unknown: "text-white/40",
  };
  return (
    <div className="text-center">
      <p className="text-white/40 text-xs mb-1">{label}</p>
      <p className={`text-xl font-semibold ${colors[status]}`}>{value}</p>
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmt(n?: number) { return n != null ? n.toLocaleString("pt-BR") : "—"; }
function fmtPct(n?: number) { return n != null ? `${n.toFixed(1)}%` : "—"; }
function fmtMs(n?: number) { return n != null ? `${Math.round(n)}ms` : "—"; }
function fmtCls(n?: number) { return n != null ? n.toFixed(3) : "—"; }

function inpStatus(v?: number): "good" | "warn" | "bad" | "unknown" {
  if (v == null) return "unknown";
  return v <= 200 ? "good" : v <= 500 ? "warn" : "bad";
}
function lcpStatus(v?: number): "good" | "warn" | "bad" | "unknown" {
  if (v == null) return "unknown";
  return v <= 2500 ? "good" : v <= 4000 ? "warn" : "bad";
}
function clsStatus(v?: number): "good" | "warn" | "bad" | "unknown" {
  if (v == null) return "unknown";
  return v <= 0.1 ? "good" : v <= 0.25 ? "warn" : "bad";
}

// Normaliza o formato de resposta da Clarity REST API
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeClarity(raw: any): ClarityMetrics {
  // A API retorna { value: [...] } com array de métricas por data
  const rows = raw?.value ?? raw?.metrics ?? [];
  if (!Array.isArray(rows) || rows.length === 0) return {};

  // Soma/média dos itens no período
  const totals = rows.reduce(
    (acc: ClarityMetrics & { count: number }, row: Record<string, number>) => {
      acc.totalSessions = (acc.totalSessions ?? 0) + (row.totalSessions ?? 0);
      acc.totalPageviews = (acc.totalPageviews ?? 0) + (row.totalPageViews ?? 0);
      acc.totalClicks = (acc.totalClicks ?? 0) + (row.totalClicks ?? 0);
      acc.deadClickRate = (acc.deadClickRate ?? 0) + (row.inactiveClicksRatio ?? 0);
      acc.rageclickRate = (acc.rageclickRate ?? 0) + (row.rageClicksRatio ?? 0);
      acc.inp = (acc.inp ?? 0) + (row.inp ?? 0);
      acc.lcp = (acc.lcp ?? 0) + (row.lcp ?? 0);
      acc.cls = (acc.cls ?? 0) + (row.cls ?? 0);
      acc.clarityScore = (acc.clarityScore ?? 0) + (row.clarityScore ?? 0);
      acc.count += 1;
      return acc;
    },
    { count: 0 }
  );

  const n = totals.count || 1;
  return {
    totalSessions: totals.totalSessions,
    totalPageviews: totals.totalPageviews,
    totalClicks: totals.totalClicks,
    deadClickRate: (totals.deadClickRate ?? 0) / n * 100,
    rageclickRate: (totals.rageclickRate ?? 0) / n * 100,
    inp: (totals.inp ?? 0) / n,
    lcp: (totals.lcp ?? 0) / n,
    cls: (totals.cls ?? 0) / n,
    clarityScore: (totals.clarityScore ?? 0) / n,
  };
}
