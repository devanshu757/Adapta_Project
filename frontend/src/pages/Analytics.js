// src/pages/Analytics.js
import React, { useEffect, useState } from "react";
import api from "../services/api";
import "./styles/Analytics.css";
import StatCard from "../components/ui/StatCard";
import ProgressRing from "../components/ui/ProgressRing";

const MOCK_KPIS = { total_tasks: 41, done: 21, in_progress: 11, todo: 9 };

const MOCK_DISTRIBUTION = [
  { label: "Critical", count: 5, color: "var(--color-danger)" },
  { label: "High",     count: 12, color: "var(--color-warning)" },
  { label: "Medium",   count: 16, color: "var(--color-info)" },
  { label: "Low",      count: 8,  color: "var(--color-success)" },
];

const MOCK_WEEKLY = [
  { week: "W1", done: 3 }, { week: "W2", done: 5 }, { week: "W3", done: 2 },
  { week: "W4", done: 7 }, { week: "W5", done: 4 }, { week: "W6", done: 8 },
  { week: "W7", done: 6 }, { week: "W8", done: 9 },
];

export default function Analytics() {
  const [kpis, setKpis] = useState(MOCK_KPIS);

  useEffect(() => {
    api.get("/analytics/kpis").then((res) => {
      if (res?.data) setKpis(res.data);
    }).catch(() => {});
  }, []);

  const total = kpis.total_tasks || 1;
  const donePct   = Math.round((kpis.done / total) * 100);
  const inProgPct = Math.round(((kpis.in_progress || 0) / total) * 100);
  const todoPct   = Math.round(((kpis.todo || 0) / total) * 100);
  const maxWeekly = Math.max(...MOCK_WEEKLY.map((w) => w.done));

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Analytics</h1>
          <p className="page-subtitle">Track performance and workload distribution</p>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="analytics-stats">
        <StatCard label="Total Tasks" value={kpis.total_tasks}
          color="var(--color-primary)" icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414a1 1 0 0 1 .293.707V19a2 2 0 0 1-2 2z"/></svg>}
        />
        <StatCard label="Completed" value={kpis.done} trend={1} trendLabel={`${donePct}%`}
          color="var(--color-success)" bgColor="var(--color-success-light)" icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>}
        />
        <StatCard label="In Progress" value={kpis.in_progress} trend={0} trendLabel={`${inProgPct}%`}
          color="var(--color-info)" bgColor="var(--color-info-light)" icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>}
        />
        <StatCard label="Backlog" value={kpis.todo} trend={-1} trendLabel={`${todoPct}%`}
          color="var(--color-warning)" bgColor="var(--color-warning-light)" icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="2"/></svg>}
        />
      </div>

      <div className="analytics-body">
        <div>
          {/* Completion rates bar chart */}
          <div className="chart-card">
            <div className="chart-card-header">
              <span className="chart-card-title">Task Status Distribution</span>
            </div>
            <div className="chart-card-body">
              <div className="bar-chart">
                {[
                  { label: "Completed",   value: kpis.done,        pct: donePct,   color: "var(--color-success)" },
                  { label: "In Progress", value: kpis.in_progress, pct: inProgPct, color: "var(--color-info)" },
                  { label: "Backlog",     value: kpis.todo,        pct: todoPct,   color: "var(--color-warning)" },
                ].map(({ label, value, pct, color }) => (
                  <div key={label} className="bar-row">
                    <span className="bar-label">{label}</span>
                    <div className="bar-track">
                      <div className="bar-fill" style={{ width: `${pct}%`, background: color }} />
                    </div>
                    <span className="bar-value">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Priority distribution bars */}
          <div className="chart-card">
            <div className="chart-card-header">
              <span className="chart-card-title">Priority Distribution</span>
            </div>
            <div className="chart-card-body">
              <div className="bar-chart">
                {MOCK_DISTRIBUTION.map(({ label, count, color }) => (
                  <div key={label} className="bar-row">
                    <span className="bar-label">{label}</span>
                    <div className="bar-track">
                      <div className="bar-fill" style={{ width: `${(count / 41) * 100}%`, background: color }} />
                    </div>
                    <span className="bar-value">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Weekly completion timeline */}
          <div className="chart-card">
            <div className="chart-card-header">
              <span className="chart-card-title">Weekly Completions</span>
            </div>
            <div className="timeline-chart">
              {MOCK_WEEKLY.map(({ week, done }) => (
                <div key={week} className="timeline-bar-group">
                  <div
                    className="timeline-bar"
                    style={{
                      height: `${(done / maxWeekly) * 80}px`,
                      background: `linear-gradient(180deg, var(--color-primary), var(--color-accent))`,
                      opacity: 0.85,
                    }}
                  />
                  <span className="timeline-bar-label">{week}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right — rings */}
        <div>
          <div className="rings-panel">
            <div className="chart-card-header">
              <span className="chart-card-title">Completion Rings</span>
            </div>
            <div className="rings-grid">
              <div className="ring-item">
                <ProgressRing percent={donePct} size={88} color="var(--color-success)" label={`${donePct}%`} />
                <span className="ring-item-label">Done</span>
                <span className="ring-item-count">{kpis.done} tasks</span>
              </div>
              <div className="ring-item">
                <ProgressRing percent={inProgPct} size={88} color="var(--color-info)" label={`${inProgPct}%`} />
                <span className="ring-item-label">In Progress</span>
                <span className="ring-item-count">{kpis.in_progress} tasks</span>
              </div>
              <div className="ring-item">
                <ProgressRing percent={todoPct} size={88} color="var(--color-warning)" label={`${todoPct}%`} />
                <span className="ring-item-label">Backlog</span>
                <span className="ring-item-count">{kpis.todo} tasks</span>
              </div>
              <div className="ring-item">
                <ProgressRing percent={Math.round((5 / 41) * 100)} size={88} color="var(--color-danger)" label="12%" />
                <span className="ring-item-label">Critical</span>
                <span className="ring-item-count">5 tasks</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
