"use client";

import { useEffect, useRef, useState } from "react";
import { Header } from "@/components/layout/Header";
import {
  CheckSquare,
  ExternalLink,
  AlertCircle,
  X,
  Check,
  Loader2,
  GripVertical,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

type Issue = {
  id: string;
  title: string;
  priority: number;
  identifier: string;
  url: string;
  stateId: string;
  stateName: string;
  stateColor: string;
  stateType: string;
  projectName: string | null;
};

type WorkflowState = {
  id: string;
  name: string;
  color: string;
  type: string;
};

type IssueDetail = {
  id: string;
  title: string;
  description: string | null;
  priority: number;
  identifier: string;
  url: string;
  stateId: string;
  stateName: string;
  stateColor: string;
  stateType: string;
  projectName: string | null;
  assigneeName: string | null;
  assigneeAvatarUrl: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  dueDate: string | null;
  labels: { id: string; name: string; color: string }[];
};

type LinearData = {
  issues: Issue[];
  states: WorkflowState[];
};

// ─── Constants ───────────────────────────────────────────────────────────────

const priorityLabel: Record<number, { label: string; color: string }> = {
  0: { label: "Sem prioridade", color: "var(--text-muted)" },
  1: { label: "Urgente",        color: "var(--mk-magenta)" },
  2: { label: "Alta",           color: "var(--mk-orange)"  },
  3: { label: "Média",          color: "var(--mk-yellow)"  },
  4: { label: "Baixa",          color: "var(--text-secondary)" },
};

function sortByPriority(a: Issue, b: Issue) {
  const pa = a.priority === 0 ? 99 : a.priority;
  const pb = b.priority === 0 ? 99 : b.priority;
  return pa - pb;
}

function fmtDate(iso: string | null) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
}

type Tab = "issues";

// ─── SectionDivider ───────────────────────────────────────────────────────────

function SectionDivider({ label, count, color }: { label: string; count: number; color?: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0 4px" }}>
      <span style={{
        fontSize: 10, fontWeight: 700, color: color ?? "var(--text-muted)",
        letterSpacing: "0.06em", textTransform: "uppercase", whiteSpace: "nowrap",
      }}>
        {label}
      </span>
      <span style={{
        fontSize: 10, color: "var(--text-muted)",
        background: "var(--bg-card)", border: "1px solid var(--border-card)",
        padding: "1px 6px", borderRadius: 20, flexShrink: 0,
      }}>
        {count}
      </span>
      <div style={{ flex: 1, height: 1, background: "var(--border-card)" }} />
    </div>
  );
}

// ─── StatusDropdown ───────────────────────────────────────────────────────────

function StatusDropdown({
  issue,
  states,
  updating,
  onStatusChange,
}: {
  issue: Issue;
  states: WorkflowState[];
  updating: boolean;
  onStatusChange: (issueId: string, state: WorkflowState) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [open]);

  return (
    <div ref={ref} style={{ position: "relative", flexShrink: 0 }}>
      <button
        onClick={(e) => { e.stopPropagation(); setOpen((v) => !v); }}
        disabled={updating}
        title={`Status: ${issue.stateName}`}
        style={{
          display: "flex", alignItems: "center", gap: 5,
          padding: "3px 8px", borderRadius: 6,
          background: "var(--bg-input)", border: "1px solid var(--border-card)",
          cursor: updating ? "wait" : "pointer",
          opacity: updating ? 0.6 : 1,
          transition: "opacity 0.12s",
        }}
      >
        {updating ? (
          <Loader2 size={8} className="animate-spin" style={{ color: "var(--accent)" }} />
        ) : (
          <span style={{
            width: 8, height: 8, borderRadius: "50%",
            background: issue.stateColor, display: "inline-block", flexShrink: 0,
          }} />
        )}
        <span style={{ fontSize: 11, color: "var(--text-muted)", whiteSpace: "nowrap" }}>
          {issue.stateName}
        </span>
      </button>

      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 4px)", left: 0, zIndex: 200,
          background: "var(--bg-sidebar)", border: "1px solid var(--border-card)",
          borderRadius: 10, padding: 4, minWidth: 190,
          boxShadow: "0 8px 40px rgba(0,0,0,0.55)",
        }}>
          {states.map((s) => (
            <button
              key={s.id}
              onClick={(e) => {
                e.stopPropagation();
                onStatusChange(issue.id, s);
                setOpen(false);
              }}
              style={{
                display: "flex", alignItems: "center", gap: 8,
                width: "100%", padding: "6px 10px", borderRadius: 6,
                background: s.id === issue.stateId ? "var(--bg-active)" : "transparent",
                border: "none", cursor: "pointer",
                color: "var(--text-primary)", fontSize: 12, textAlign: "left",
              }}
              onMouseEnter={(e) => {
                if (s.id !== issue.stateId) e.currentTarget.style.background = "var(--bg-card-hover)";
              }}
              onMouseLeave={(e) => {
                if (s.id !== issue.stateId) e.currentTarget.style.background = "transparent";
              }}
            >
              <span style={{
                width: 10, height: 10, borderRadius: "50%",
                background: s.color, flexShrink: 0, display: "inline-block",
              }} />
              {s.name}
              {s.id === issue.stateId && (
                <Check size={11} style={{ marginLeft: "auto", color: "var(--accent)" }} />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── IssueCard ────────────────────────────────────────────────────────────────

function IssueCard({
  issue, states, updating, onStatusChange, onOpenModal,
  dragOverId, onDragStart, onDragOver, onDrop,
}: {
  issue: Issue; states: WorkflowState[]; updating: boolean;
  onStatusChange: (issueId: string, state: WorkflowState) => void;
  onOpenModal: (id: string) => void;
  dragOverId: string | null;
  onDragStart: (id: string) => void;
  onDragOver: (id: string) => void;
  onDrop: (targetId: string) => void;
}) {
  const isDone = issue.stateType === "completed" || issue.stateType === "cancelled";
  const borderColor = isDone ? "#1488D8" : issue.stateColor;
  const isOver = dragOverId === issue.id;
  return (
    <div
      draggable
      onDragStart={(e) => { e.dataTransfer.effectAllowed = "move"; onDragStart(issue.id); }}
      onDragOver={(e) => { e.preventDefault(); onDragOver(issue.id); }}
      onDrop={(e) => { e.preventDefault(); onDrop(issue.id); }}
      onClick={() => onOpenModal(issue.id)}
      style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "10px 14px",
        background: isOver ? "var(--bg-card-hover)" : "var(--bg-card)",
        border: `1px solid ${isOver ? "var(--mk-purple)" : "var(--border-card)"}`,
        borderLeft: `3px solid ${borderColor}`,
        borderRadius: 12,
        cursor: "pointer", transition: "all 0.16s",
        userSelect: "none",
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.boxShadow = "0 0 0 1px var(--mk-purple-glow)";
        el.style.background = "var(--bg-card-hover)";
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.boxShadow = "none";
        el.style.background = isOver ? "var(--bg-card-hover)" : "var(--bg-card)";
      }}
    >
      {/* Drag handle */}
      <GripVertical size={13} onClick={(e) => e.stopPropagation()} style={{ color: "var(--text-muted)", cursor: "grab", flexShrink: 0, opacity: 0.35, marginRight: 4 }} />

      {/* Left side */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0, flex: 1 }}>
        <StatusDropdown issue={issue} states={states} updating={updating} onStatusChange={onStatusChange} />
        <span style={{ color: "var(--text-muted)", fontSize: 11, flexShrink: 0, fontFamily: "monospace" }}>
          {issue.identifier}
        </span>
        <span style={{
          color: "var(--text-primary)", fontSize: 13,
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          textDecoration: isDone ? "line-through" : "none", opacity: isDone ? 0.65 : 1,
        }}>
          {issue.title}
        </span>
        {issue.projectName && (
          <span style={{
            fontSize: 10, color: "var(--text-muted)",
            background: "var(--bg-input)", border: "1px solid var(--border-card)",
            padding: "1px 6px", borderRadius: 4, flexShrink: 0,
            maxWidth: 140, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>
            {issue.projectName}
          </span>
        )}
      </div>

      {/* Right side */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0, marginLeft: 12 }}>
        <span style={{ fontSize: 11, color: priorityLabel[issue.priority]?.color, flexShrink: 0 }}>
          {priorityLabel[issue.priority]?.label}
        </span>
        <a
          href={issue.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          title="Abrir no Linear"
          style={{ color: "var(--text-muted)", display: "flex", flexShrink: 0 }}
        >
          <ExternalLink size={12} />
        </a>
      </div>
    </div>
  );
}

// ─── IssueModal ───────────────────────────────────────────────────────────────

function IssueModal({
  loading,
  detail,
  onClose,
}: {
  loading: boolean;
  detail: IssueDetail | null;
  onClose: () => void;
}) {
  useEffect(() => {
    function handleEsc(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 300,
        background: "rgba(0,0,0,0.65)", backdropFilter: "blur(6px)",
        display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "var(--bg-sidebar)", borderRadius: 16,
          border: "1px solid var(--border-card)",
          width: "100%", maxWidth: 640, maxHeight: "82vh",
          overflow: "auto", position: "relative",
          boxShadow: "0 24px 80px rgba(0,0,0,0.6)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: "absolute", top: 16, right: 16, zIndex: 10,
            background: "var(--bg-card)", border: "1px solid var(--border-card)",
            borderRadius: 8, padding: 6, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "var(--text-muted)",
          }}
        >
          <X size={14} />
        </button>

        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: 64 }}>
            <Loader2 size={28} className="animate-spin" style={{ color: "var(--accent)" }} />
          </div>
        ) : detail ? (
          <div style={{ padding: 28 }}>
            {/* Header */}
            <div style={{ marginBottom: 20, paddingRight: 32 }}>
              <span style={{
                fontSize: 11, color: "var(--text-muted)", fontFamily: "monospace",
                background: "var(--bg-card)", border: "1px solid var(--border-card)",
                padding: "2px 8px", borderRadius: 6, display: "inline-block", marginBottom: 10,
              }}>
                {detail.identifier}
              </span>
              <h2 style={{ color: "var(--text-primary)", fontSize: 18, fontWeight: 700, lineHeight: 1.3 }}>
                {detail.title}
              </h2>
            </div>

            {/* Status bar */}
            <div style={{
              display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap",
              padding: "10px 14px", background: "var(--bg-card)",
              border: "1px solid var(--border-card)", borderRadius: 10, marginBottom: 20,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{
                  width: 10, height: 10, borderRadius: "50%",
                  background: detail.stateColor, display: "inline-block",
                }} />
                <span style={{ fontSize: 12, color: "var(--text-primary)" }}>{detail.stateName}</span>
              </div>
              <span style={{ color: "var(--border-card)" }}>·</span>
              <span style={{ fontSize: 12, color: priorityLabel[detail.priority]?.color }}>
                {priorityLabel[detail.priority]?.label}
              </span>
              {detail.projectName && (
                <>
                  <span style={{ color: "var(--border-card)" }}>·</span>
                  <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{detail.projectName}</span>
                </>
              )}
            </div>

            {/* Description */}
            {detail.description ? (
              <div style={{ marginBottom: 20 }}>
                <p style={{
                  fontSize: 11, fontWeight: 600, color: "var(--text-muted)",
                  textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8,
                }}>
                  Descrição
                </p>
                <div style={{
                  fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.65,
                  whiteSpace: "pre-wrap", wordBreak: "break-word",
                  background: "var(--bg-card)", border: "1px solid var(--border-card)",
                  borderRadius: 10, padding: "12px 14px",
                }}>
                  {detail.description}
                </div>
              </div>
            ) : (
              <div style={{ marginBottom: 20 }}>
                <div style={{
                  padding: "12px 14px", background: "var(--bg-card)",
                  border: "1px solid var(--border-card)", borderRadius: 10,
                }}>
                  <p style={{ fontSize: 13, color: "var(--text-muted)", fontStyle: "italic" }}>
                    Sem descrição.
                  </p>
                </div>
              </div>
            )}

            {/* Details grid */}
            <div style={{
              borderTop: "1px solid var(--border-card)", paddingTop: 16, marginBottom: 20,
              display: "flex", flexDirection: "column", gap: 10,
            }}>
              {detail.assigneeName && (
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <span style={{ fontSize: 11, color: "var(--text-muted)", width: 90, flexShrink: 0 }}>Atribuído a</span>
                  <span style={{ fontSize: 13, color: "var(--text-primary)" }}>{detail.assigneeName}</span>
                </div>
              )}
              {detail.labels.length > 0 && (
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <span style={{ fontSize: 11, color: "var(--text-muted)", width: 90, flexShrink: 0 }}>Labels</span>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {detail.labels.map((l) => (
                      <span
                        key={l.id}
                        style={{
                          fontSize: 11, padding: "2px 8px", borderRadius: 20,
                          background: l.color + "22", border: `1px solid ${l.color}66`,
                          color: l.color,
                        }}
                      >
                        {l.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {detail.dueDate && (
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <span style={{ fontSize: 11, color: "var(--text-muted)", width: 90, flexShrink: 0 }}>Vencimento</span>
                  <span style={{ fontSize: 13, color: "var(--mk-orange)" }}>
                    {fmtDate(detail.dueDate)}
                  </span>
                </div>
              )}
              {detail.createdAt && (
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <span style={{ fontSize: 11, color: "var(--text-muted)", width: 90, flexShrink: 0 }}>Criado em</span>
                  <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>{fmtDate(detail.createdAt)}</span>
                </div>
              )}
              {detail.updatedAt && (
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <span style={{ fontSize: 11, color: "var(--text-muted)", width: 90, flexShrink: 0 }}>Atualizado</span>
                  <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>{fmtDate(detail.updatedAt)}</span>
                </div>
              )}
            </div>

            {/* Footer */}
            <div style={{ borderTop: "1px solid var(--border-card)", paddingTop: 16 }}>
              <a
                href={detail.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 500,
                  background: "var(--mk-purple)", color: "#fff",
                  textDecoration: "none", transition: "opacity 0.12s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
              >
                Abrir no Linear
                <ExternalLink size={13} />
              </a>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function LinearPage() {
  const [data, setData] = useState<LinearData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("issues");
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalDetail, setModalDetail] = useState<IssueDetail | null>(null);
  const [modalLoading, setModalLoading] = useState(false);

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

  async function handleStatusChange(issueId: string, newState: WorkflowState) {
    if (!data) return;
    const prevIssues = data.issues;

    // Optimistic update
    setData((prev) =>
      prev
        ? {
            ...prev,
            issues: prev.issues.map((i) =>
              i.id === issueId
                ? { ...i, stateId: newState.id, stateName: newState.name, stateColor: newState.color, stateType: newState.type }
                : i
            ),
          }
        : null
    );

    setUpdatingStatus(issueId);
    try {
      const res = await fetch("/api/linear", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ issueId, stateId: newState.id }),
      });
      if (!res.ok) throw new Error("Falha ao atualizar status");
    } catch {
      // Revert on failure
      setData((prev) => (prev ? { ...prev, issues: prevIssues } : null));
    } finally {
      setUpdatingStatus(null);
    }
  }

  async function openModal(issueId: string) {
    setModalOpen(true);
    setModalDetail(null);
    setModalLoading(true);
    try {
      const res = await fetch(`/api/linear?issueId=${issueId}`);
      const d = await res.json();
      setModalDetail(d);
    } finally {
      setModalLoading(false);
    }
  }

  function closeModal() {
    setModalOpen(false);
    setModalDetail(null);
  }

  // Drag state
  const [issueOrder, setIssueOrder] = useState<string[]>([]);
  const [dragId, setDragId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  function handleDrop(targetId: string, sectionIssues: Issue[]) {
    if (!dragId || dragId === targetId) { setDragId(null); setDragOverId(null); return; }
    const current = issueOrder.length > 0 ? issueOrder : sectionIssues.map((i) => i.id);
    const from = current.indexOf(dragId);
    const to = current.indexOf(targetId);
    if (from < 0 || to < 0) { setDragId(null); setDragOverId(null); return; }
    const next = [...current];
    next.splice(from, 1);
    next.splice(to, 0, dragId);
    setIssueOrder(next);
    setDragId(null);
    setDragOverId(null);
  }

  function applyOrder(issues: Issue[]): Issue[] {
    if (issueOrder.length === 0) return issues;
    const map = new Map(issueOrder.map((id, idx) => [id, idx]));
    return [...issues].sort((a, b) => {
      const ai = map.has(a.id) ? map.get(a.id)! : Number.MAX_SAFE_INTEGER;
      const bi = map.has(b.id) ? map.get(b.id)! : Number.MAX_SAFE_INTEGER;
      return ai - bi;
    });
  }

  const tabs: { key: Tab; label: string; icon: typeof CheckSquare; count?: number }[] = [
    { key: "issues", label: "Tasks", icon: CheckSquare, count: data?.issues.filter((i) => i.stateType !== "completed" && i.stateType !== "cancelled").length },
  ];

  // Grouped + sorted issues
  const activeIssues = (data?.issues ?? []).filter((i) => i.stateType !== "completed" && i.stateType !== "cancelled");
  const startedIssues   = applyOrder(activeIssues.filter((i) => i.stateType === "started").sort(sortByPriority));
  const unstartedIssues = applyOrder(activeIssues.filter((i) => i.stateType !== "started").sort(sortByPriority));
  const doneIssues      = (data?.issues ?? []).filter((i) => i.stateType === "completed" || i.stateType === "cancelled");
  const states = data?.states ?? [];

  return (
    <div className="flex flex-col flex-1">
      <Header title="Linear" subtitle="Minhas Tasks" />

      <div className="flex-1 p-6 space-y-4">
        {/* Tabs */}
        <div style={{ display: "flex", gap: 6, borderBottom: "1px solid var(--border)", paddingBottom: 4 }}>
          {tabs.map(({ key, label, icon: Icon, count }) => {
            const active = tab === key;
            return (
              <button
                key={key}
                onClick={() => setTab(key)}
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "6px 14px", borderRadius: 8, fontSize: 13,
                  border: "1px solid",
                  borderColor: active ? "var(--glass-border)" : "transparent",
                  background: active ? "var(--bg-active)" : "transparent",
                  backdropFilter: active ? "blur(12px) saturate(160%)" : "none",
                  WebkitBackdropFilter: active ? "blur(12px) saturate(160%)" : "none",
                  color: active ? "var(--accent)" : "var(--text-muted)",
                  fontWeight: active ? 600 : 400,
                  boxShadow: active ? "inset 0 0 12px var(--mk-purple-glow)" : "none",
                  cursor: "pointer",
                  transition: "all 0.16s cubic-bezier(0.4, 0, 0.2, 1)",
                  marginBottom: active ? -1 : 0,
                }}
              >
                <Icon size={14} />
                {label}
                {count !== undefined && (
                  <span style={{
                    fontSize: 11, background: "var(--bg-card)",
                    border: "1px solid var(--border-card)",
                    color: "var(--text-muted)", padding: "1px 6px", borderRadius: 20,
                  }}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Error */}
        {error && (
          <div style={{
            display: "flex", alignItems: "center", gap: 12,
            background: "rgba(229,19,142,0.08)", border: "1px solid rgba(229,19,142,0.20)",
            borderRadius: 12, padding: "12px 16px",
          }}>
            <AlertCircle size={16} style={{ color: "var(--mk-magenta)", flexShrink: 0 }} />
            <div>
              <p style={{ color: "var(--mk-magenta)", fontSize: 13 }}>{error}</p>
              {(error.includes("LINEAR_API_KEY") || error.includes("not set")) && (
                <p style={{ color: "var(--text-muted)", fontSize: 11, marginTop: 4 }}>
                  Adicione{" "}
                  <code style={{ background: "var(--bg-card)", padding: "1px 4px", borderRadius: 4 }}>
                    LINEAR_API_KEY=lin_api_...
                  </code>{" "}
                  no arquivo{" "}
                  <code style={{ background: "var(--bg-card)", padding: "1px 4px", borderRadius: 4 }}>
                    .env.local
                  </code>
                </p>
              )}
            </div>
          </div>
        )}

        {/* Loading skeleton */}
        {loading && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} style={{ height: 48, background: "var(--bg-card)", borderRadius: 12, animation: "pulse 1.5s infinite" }} />
            ))}
          </div>
        )}

        {/* ── Issues tab ────────────────────────────────────────────── */}
        {!loading && tab === "issues" && data && (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {data.issues.length === 0 && (
              <p style={{ color: "var(--text-muted)", fontSize: 13, textAlign: "center", padding: "32px 0" }}>
                Nenhuma task atribuída a você.
              </p>
            )}

            {/* In Progress */}
            {startedIssues.length > 0 && (
              <>
                <SectionDivider label="Em Andamento" count={startedIssues.length} color="var(--mk-green)" />
                <div onDragLeave={() => setDragOverId(null)} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {startedIssues.map((issue) => (
                    <IssueCard
                      key={issue.id}
                      issue={issue}
                      states={states}
                      updating={updatingStatus === issue.id}
                      onStatusChange={handleStatusChange}
                      onOpenModal={openModal}
                      dragOverId={dragOverId}
                      onDragStart={setDragId}
                      onDragOver={setDragOverId}
                      onDrop={(targetId) => handleDrop(targetId, startedIssues)}
                    />
                  ))}
                </div>
              </>
            )}

            {/* To Do / In Analysis */}
            {unstartedIssues.length > 0 && (
              <>
                <SectionDivider label="Em Análise / A Fazer" count={unstartedIssues.length} />
                <div onDragLeave={() => setDragOverId(null)} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {unstartedIssues.map((issue) => (
                    <IssueCard
                      key={issue.id}
                      issue={issue}
                      states={states}
                      updating={updatingStatus === issue.id}
                      onStatusChange={handleStatusChange}
                      onOpenModal={openModal}
                      dragOverId={dragOverId}
                      onDragStart={setDragId}
                      onDragOver={setDragOverId}
                      onDrop={(targetId) => handleDrop(targetId, unstartedIssues)}
                    />
                  ))}
                </div>
              </>
            )}

            {/* Done */}
            {doneIssues.length > 0 && (
              <>
                <SectionDivider label="Concluídas" count={doneIssues.length} color="var(--mk-blue)" />
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {doneIssues.map((issue) => (
                    <IssueCard
                      key={issue.id}
                      issue={issue}
                      states={states}
                      updating={updatingStatus === issue.id}
                      onStatusChange={handleStatusChange}
                      onOpenModal={openModal}
                      dragOverId={null}
                      onDragStart={() => {}}
                      onDragOver={() => {}}
                      onDrop={() => {}}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        )}

      </div>

      {/* ── Modal ───────────────────────────────────────────────────── */}
      {modalOpen && (
        <IssueModal loading={modalLoading} detail={modalDetail} onClose={closeModal} />
      )}
    </div>
  );
}
