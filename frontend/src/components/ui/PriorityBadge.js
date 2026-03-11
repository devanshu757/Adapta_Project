import React from "react";
import "./PriorityBadge.css";

export function getPriorityLevel(score) {
  if (score >= 80) return "critical";
  if (score >= 60) return "high";
  if (score >= 35) return "medium";
  return "low";
}

export function getPriorityLabel(score) {
  if (score >= 80) return "Critical";
  if (score >= 60) return "High";
  if (score >= 35) return "Medium";
  return "Low";
}

export function PriorityBadge({ score }) {
  const level = getPriorityLevel(Number(score) || 0);
  const label = getPriorityLabel(Number(score) || 0);
  return (
    <span className={`priority-badge priority-${level}`}>
      <span className="priority-badge-dot" />
      {label}
    </span>
  );
}

export function StatusBadge({ status }) {
  const label = status === "in-progress" ? "In Progress"
    : status === "todo" ? "To Do"
    : status === "done" ? "Done"
    : status === "blocked" ? "Blocked"
    : status || "To Do";
  return (
    <span className={`status-badge status-${status || "todo"}`}>
      {label}
    </span>
  );
}
