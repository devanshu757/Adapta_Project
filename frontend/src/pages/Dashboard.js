// src/pages/Dashboard.js
import React, { useEffect, useState } from "react";
import api from "../services/api";
import "./styles/Dashboard.css";
import StatCard from "../components/ui/StatCard";
import TaskCard from "../components/ui/TaskCard";
import ProgressRing from "../components/ui/ProgressRing";
import EmptyState from "../components/ui/EmptyState";

const MOCK_TASKS = [
  { id: "1", title: "Redesign authentication flow", priority: 92, impact: 9, effort: 4, risk: 3, status: "in-progress", description: "Update login/signup UI to match new design system, add OAuth providers.", projectId: "p1" },
  { id: "2", title: "Fix database connection pooling", priority: 78, impact: 8, effort: 6, risk: 7, status: "todo", description: "Max connections exceeded in production, causing intermittent 503 errors.", projectId: "p1" },
  { id: "3", title: "Write unit tests for priority engine", priority: 65, impact: 7, effort: 5, risk: 2, status: "todo", description: "Coverage below 40%; need tests for scoring algorithm and edge cases.", projectId: "p2" },
  { id: "4", title: "Update API documentation", priority: 42, impact: 5, effort: 3, risk: 1, status: "done", description: "OpenAPI spec is outdated — missing new endpoints added in sprint 8.", projectId: "p2" },
  { id: "5", title: "Implement notification system", priority: 35, impact: 6, effort: 8, risk: 4, status: "todo", description: "Push + in-app notifications for task assignment and deadline alerts.", projectId: "p3" },
];

const MOCK_ACTIVITY = [
  { id: 1, color: "var(--color-success)", text: "Task \"Deploy staging environment\" marked done", time: "2 min ago" },
  { id: 2, color: "var(--color-primary)", text: "New task \"Fix login bug\" added to Project Alpha", time: "14 min ago" },
  { id: 3, color: "var(--color-warning)", text: "Priority re-calculated for 8 tasks", time: "1 hour ago" },
  { id: 4, color: "var(--color-info)", text: "Team member @sarah joined Project Beta", time: "3 hours ago" },
  { id: 5, color: "var(--color-danger)", text: "Task \"API rate limiting\" marked as blocked", time: "5 hours ago" },
];

export default function Dashboard() {
  const [tasks, setTasks] = useState(MOCK_TASKS);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await api.get("/tasks");
        const list = (res?.data || []).map((t) => ({
          id: t.id || t._id || t.Id,
          title: t.title || t.name,
          priority: Number(t.priority ?? t.Priority ?? 0),
          impact: Number(t.impact ?? 5),
          effort: Number(t.effort ?? 5),
          risk: Number(t.risk ?? 5),
          status: t.status || "todo",
          description: t.description || "",
          projectId: t.projectId || t.project_id || t.ProjectId,
        }));
        list.sort((a, b) => b.priority - a.priority);
        if (list.length > 0) setTasks(list);
      } catch { /* use mock */ }
      setLoading(false);
    };
    fetchData();
  }, []);

  const total     = tasks.length;
  const done      = tasks.filter((t) => t.status === "done").length;
  const inProg    = tasks.filter((t) => t.status === "in-progress").length;
  const highPri   = tasks.filter((t) => t.priority >= 60).length;
  const donePct   = total ? Math.round((done / total) * 100) : 0;
  const inProgPct = total ? Math.round((inProg / total) * 100) : 0;
  const highPct   = total ? Math.round((highPri / total) * 100) : 0;

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Your prioritized task overview</p>
        </div>
      </div>

      {/* Stats row */}
      <div className="dashboard-stats">
        <StatCard
          label="Total Tasks"
          value={total}
          color="var(--color-primary)"
          bgColor="var(--color-primary-glow)"
          icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414a1 1 0 0 1 .293.707V19a2 2 0 0 1-2 2z"/></svg>}
        />
        <StatCard
          label="In Progress"
          value={inProg}
          color="var(--color-info)"
          bgColor="var(--color-info-light)"
          trend={1}
          trendLabel={`${inProgPct}%`}
          icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>}
        />
        <StatCard
          label="Completed"
          value={done}
          color="var(--color-success)"
          bgColor="var(--color-success-light)"
          trend={1}
          trendLabel={`${donePct}%`}
          icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>}
        />
        <StatCard
          label="High Priority"
          value={highPri}
          color="var(--color-warning)"
          bgColor="var(--color-warning-light)"
          trend={-1}
          trendLabel={`${highPct}%`}
          icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="m10.29 3.86-8 14A1 1 0 0 0 3.15 19.5h17.7a1 1 0 0 0 .86-1.5l-8-14a1 1 0 0 0-1.72 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>}
        />
      </div>

      <div className="dashboard-body">
        {/* Task list */}
        <div>
          <div className="dashboard-tasks-header">
            <h2 className="dashboard-tasks-title">Top Priority Tasks</h2>
            {loading && <div className="spinner spinner-sm" />}
          </div>
          <div className="dashboard-tasks-list">
            {tasks.slice(0, 8).length === 0 ? (
              <EmptyState title="No tasks yet" description="Create your first project and add tasks to get started." />
            ) : (
              tasks.slice(0, 8).map((t) => (
                <TaskCard key={t.id} task={t} showProject />
              ))
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div>
          {/* Overview rings */}
          <div className="dashboard-overview">
            <div className="dashboard-overview-title">Completion Overview</div>
            <div className="dashboard-rings">
              <div className="dashboard-ring-item">
                <ProgressRing percent={donePct} size={76} color="var(--color-success)" label={`${donePct}%`} />
                <span className="dashboard-ring-label">Done</span>
              </div>
              <div className="dashboard-ring-item">
                <ProgressRing percent={inProgPct} size={76} color="var(--color-info)" label={`${inProgPct}%`} />
                <span className="dashboard-ring-label">Active</span>
              </div>
              <div className="dashboard-ring-item">
                <ProgressRing percent={highPct} size={76} color="var(--color-danger)" label={`${highPct}%`} />
                <span className="dashboard-ring-label">Critical</span>
              </div>
            </div>
          </div>

          {/* Activity feed */}
          <div className="dashboard-activity">
            <div className="dashboard-activity-header">Recent Activity</div>
            {MOCK_ACTIVITY.map((a) => (
              <div key={a.id} className="activity-item">
                <div className="activity-dot" style={{ background: a.color }} />
                <div>
                  <div className="activity-text">{a.text}</div>
                  <div className="activity-time">{a.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
