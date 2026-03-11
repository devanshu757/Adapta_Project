// src/pages/ProjectDetail.js
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";
import "./styles/ProjectDetail.css";
import TaskCard from "../components/ui/TaskCard";
import EmptyState from "../components/ui/EmptyState";

const MOCK_TASKS = [
  { id: "t1", title: "Set up CI/CD pipeline", priority: 88, impact: 9, effort: 5, risk: 3, status: "done", description: "GitHub Actions workflow for automated tests and deployments.", projectId: "demo" },
  { id: "t2", title: "Design system tokens", priority: 75, impact: 8, effort: 4, risk: 2, status: "in-progress", description: "CSS variables for colors, spacing, typography, and shadows.", projectId: "demo" },
  { id: "t3", title: "REST API integration", priority: 68, impact: 7, effort: 6, risk: 5, status: "in-progress", description: "Connect frontend to Java Spring Boot backend endpoints.", projectId: "demo" },
  { id: "t4", title: "MongoDB schema design", priority: 55, impact: 6, effort: 5, risk: 4, status: "todo", description: "Define collections for users, projects, tasks, and profiles.", projectId: "demo" },
  { id: "t5", title: "Write API docs", priority: 30, impact: 4, effort: 2, risk: 1, status: "todo", description: "OpenAPI specification for all REST endpoints.", projectId: "demo" },
  { id: "t6", title: "User acceptance testing", priority: 42, impact: 5, effort: 6, risk: 3, status: "todo", description: "End-to-end test scenarios for core user workflows.", projectId: "demo" },
];

const COLUMNS = [
  { key: "todo",        label: "To Do",       color: "var(--text-muted)" },
  { key: "in-progress", label: "In Progress",  color: "var(--color-info)" },
  { key: "done",        label: "Done",         color: "var(--color-success)" },
];

const normalizeTask = (t) => ({
  id: t.id || t._id || t.Id,
  title: t.title || t.name || "",
  description: t.description || t.Description || "",
  impact: Number(t.impact ?? t.Impact ?? 5),
  effort: Number(t.effort ?? t.Effort ?? 5),
  risk: Number(t.risk ?? t.Risk ?? 5),
  priority: Number(t.priority ?? t.Priority ?? 0),
  projectId: t.projectId || t.project_id || t.ProjectId || t.project,
  status: t.status || "todo",
});

export default function ProjectDetail() {
  const { id: projectId } = useParams();
  const [tasks, setTasks] = useState(MOCK_TASKS.map((t) => ({ ...t, projectId })));
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [impact, setImpact] = useState(5);
  const [effort, setEffort] = useState(5);
  const [risk, setRisk] = useState(5);
  const [generateDetails, setGenerateDetails] = useState(false);
  const [seedPrompt, setSeedPrompt] = useState("");

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await api.get(`/projects/${projectId}/tasks`);
        const data = (res?.data || []).map(normalizeTask);
        if (data.length > 0) { data.sort((a, b) => (b.priority || 0) - (a.priority || 0)); setTasks(data); }
      } catch {
        try {
          const res = await api.get("/tasks");
          const filtered = (res?.data || []).map(normalizeTask).filter((t) => String(t.projectId) === String(projectId));
          if (filtered.length > 0) { filtered.sort((a, b) => (b.priority || 0) - (a.priority || 0)); setTasks(filtered); }
        } catch { /* use mock */ }
      }
    };
    fetchTasks();
  }, [projectId]);

  const createTask = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    setLoading(true);
    try {
      await api.post("/tasks", { projectId, title, impact: Number(impact), effort: Number(effort), risk: Number(risk), generateDetails, seedPrompt });
      await api.put("/tasks/prioritize").catch(() => {});
      const res = await api.get(`/projects/${projectId}/tasks`);
      const data = (res?.data || []).map(normalizeTask);
      data.sort((a, b) => (b.priority || 0) - (a.priority || 0));
      setTasks(data.length > 0 ? data : tasks);
    } catch {
      // Optimistic local add
      const newTask = { id: `local-${Date.now()}`, title, impact: Number(impact), effort: Number(effort), risk: Number(risk), priority: Math.round((Number(impact) * 10) - (Number(effort) * 5) + (10 - Number(risk)) * 3), status: "todo", description: "", projectId };
      setTasks((cur) => [newTask, ...cur].sort((a, b) => b.priority - a.priority));
    } finally {
      setLoading(false);
      setTitle(""); setSeedPrompt(""); setGenerateDetails(false); setImpact(5); setEffort(5); setRisk(5);
      setShowForm(false);
    }
  };

  const byStatus = (status) => tasks.filter((t) => (t.status || "todo") === status);

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Project Tasks</h1>
          <p className="page-subtitle">Ranked by priority score</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm((v) => !v)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} style={{ width: 16, height: 16 }}>
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          {showForm ? "Cancel" : "Add Task"}
        </button>
      </div>

      {/* Add task panel */}
      {showForm && (
        <div className="task-form-panel">
          <div className="task-form-panel-title">
            <span>New Task</span>
          </div>
          <form onSubmit={createTask}>
            <div className="form-group" style={{ marginBottom: "var(--space-4)" }}>
              <label className="form-label">Task Title *</label>
              <input className="form-control" placeholder="What needs to be done?" value={title} onChange={(e) => setTitle(e.target.value)} required autoFocus />
            </div>

            <div className="task-form-grid">
              {[{ label: "Impact", val: impact, set: setImpact, color: "var(--color-success)" },
                { label: "Effort", val: effort, set: setEffort, color: "var(--color-warning)" },
                { label: "Risk",   val: risk,   set: setRisk,   color: "var(--color-danger)" },
              ].map(({ label, val, set, color }) => (
                <div key={label} className="task-metric-group">
                  <label className="form-label">{label}</label>
                  <div className="task-metric-value" style={{ color }}>{val}</div>
                  <div className="task-metric-track">
                    <span style={{ fontSize: 10, color: "var(--text-muted)" }}>1</span>
                    <input type="range" min="1" max="10" value={val} onChange={(e) => set(Number(e.target.value))} className="form-range" />
                    <span style={{ fontSize: 10, color: "var(--text-muted)" }}>10</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="ai-toggle-row" style={{ marginBottom: "var(--space-4)" }}>
              <div className="ai-toggle-label">
                <strong>✨ AI-Generated Description</strong>
                <span>Auto-fill task details and context using AI</span>
              </div>
              <label className="toggle-switch">
                <input type="checkbox" checked={generateDetails} onChange={(e) => setGenerateDetails(e.target.checked)} />
                <span className="toggle-slider" />
              </label>
            </div>

            {generateDetails && (
              <div className="form-group" style={{ marginBottom: "var(--space-4)" }}>
                <label className="form-label">Prompt hint (optional)</label>
                <input className="form-control" placeholder="Brief context for AI generation…" value={seedPrompt} onChange={(e) => setSeedPrompt(e.target.value)} />
              </div>
            )}

            <div style={{ display: "flex", gap: "var(--space-3)", justifyContent: "flex-end" }}>
              <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? <><div className="spinner spinner-sm" /> Adding…</> : "Add Task"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Kanban Board */}
      <div className="kanban-board">
        {COLUMNS.map((col) => {
          const colTasks = byStatus(col.key);
          return (
            <div key={col.key} className="kanban-column">
              <div className="kanban-col-header">
                <div className="kanban-col-title">
                  <div className="kanban-col-dot" style={{ background: col.color }} />
                  {col.label}
                </div>
                <span className="kanban-col-count">{colTasks.length}</span>
              </div>
              <div className="kanban-cards">
                {colTasks.length === 0 ? (
                  <EmptyState
                    title={`No ${col.label.toLowerCase()} tasks`}
                    description=""
                    icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} style={{ width: 24, height: 24 }}><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2" /></svg>}
                  />
                ) : (
                  colTasks.map((t) => <TaskCard key={t.id} task={t} />)
                )}
              </div>
              <button className="add-task-toggle" onClick={() => setShowForm(true)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={{ width: 14, height: 14 }}>
                  <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Add task
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
