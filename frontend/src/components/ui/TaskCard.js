import React from "react";
import { getPriorityLevel } from "./PriorityBadge";
import { PriorityBadge, StatusBadge } from "./PriorityBadge";
import { Link } from "react-router-dom";
import "./TaskCard.css";

export default function TaskCard({ task, showProject }) {
  const level = getPriorityLevel(Number(task.priority) || 0);

  return (
    <div className={`task-card priority-${level}`}>
      <div className="task-card-header">
        <div className="task-card-title">{task.title || "Untitled Task"}</div>
        <div className="task-card-priority-score">{task.priority ?? "—"}</div>
      </div>

      {task.description && (
        <div className="task-card-description">{task.description}</div>
      )}

      <div className="task-card-meta">
        <PriorityBadge score={task.priority} />
        <StatusBadge status={task.status} />
        {task.impact != null && (
          <span className="task-card-metric">
            <span className="task-card-metric-label">Impact</span> {task.impact}
          </span>
        )}
        {task.effort != null && (
          <span className="task-card-metric">
            <span className="task-card-metric-label">Effort</span> {task.effort}
          </span>
        )}
        {task.risk != null && (
          <span className="task-card-metric">
            <span className="task-card-metric-label">Risk</span> {task.risk}
          </span>
        )}
      </div>

      {showProject && task.projectId && (
        <div className="task-card-footer">
          <Link
            to={`/projects/${task.projectId}`}
            className="btn btn-ghost btn-sm"
            style={{ fontSize: 11, padding: "2px 8px" }}
          >
            View Project →
          </Link>
        </div>
      )}
    </div>
  );
}
