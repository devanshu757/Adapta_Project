// src/Dashboard.js
import React, { useEffect, useState } from "react";
import api from "../services/api";
import { Link } from "react-router-dom";
import "./styles/ Dashboard.css";

export default function Dashboard() {
  const [tasks, setTasks] = useState([]);

  useEffect(() => { fetch(); }, []);

  async function fetch() {
    try {
      const res = await api.get("/tasks");
      const list = (res?.data || []).map(t => ({
        id: t.id || t._id || t.Id,
        title: t.title || t.name,
        priority: Number(t.priority ?? t.Priority ?? 0),
        projectId: t.projectId || t.project_id || t.ProjectId
      }));
      list.sort((a,b)=>b.priority - a.priority);
      setTasks(list);
    } catch (err) { console.error(err); }
  }

  return (
    <div>
      <h2 className="dashboard-title">Top tasks by priority</h2>
      <div className="list-group">
        {tasks.slice(0,20).map(t => (
          <div key={t.id} className="list-group-item d-flex justify-content-between align-items-center">
            <div>{t.title}</div>
            <div>
              <span className="badge bg-danger me-2">{t.priority}</span>
              {t.projectId && <Link to={`/projects/${t.projectId}`} className="btn btn-sm btn-outline-secondary">Project</Link>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
