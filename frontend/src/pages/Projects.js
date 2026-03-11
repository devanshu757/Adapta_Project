// src/pages/Projects.js
import React, { useEffect, useState } from "react";
import api from "../services/api";
import { Link } from "react-router-dom";
import "./styles/Projects.css";
import Modal from "../components/ui/Modal";
import EmptyState from "../components/ui/EmptyState";

const MOCK_PROJECTS = [
  { id: "p1", name: "Platform Redesign", tasks: 12, done: 7, createdAt: "2025-08-01" },
  { id: "p2", name: "Backend API v2", tasks: 8, done: 3, createdAt: "2025-09-10" },
  { id: "p3", name: "Mobile App MVP", tasks: 15, done: 5, createdAt: "2025-10-05" },
  { id: "p4", name: "Analytics Dashboard", tasks: 6, done: 6, createdAt: "2025-11-20" },
];

const FolderIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <path d="M2 7a2 2 0 0 1 2-2h4l2 3h10a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2z" />
  </svg>
);

export default function Projects() {
  const [projects, setProjects] = useState(MOCK_PROJECTS);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await api.get("/projects");
        const list = (res?.data || []).map((p) => ({
          id: p.id || p._id || p.Id,
          name: p.name || "Untitled",
          tasks: p.tasks || p.taskCount || 0,
          done: p.done || p.doneCount || 0,
          createdAt: p.createdAt || p.created_at || "",
        }));
        if (list.filter((p) => p.id).length > 0) setProjects(list.filter((p) => p.id));
      } catch { /* use mock */ }
    };
    fetchProjects();
  }, []);

  const createProject = async () => {
    if (!name.trim()) return;
    setLoading(true);
    try {
      const res = await api.post("/projects", { name });
      const p = res?.data;
      const id = p?.id || p?._id || p?.Id || `p${Date.now()}`;
      setProjects((cur) => [{ id, name: p?.name || name, tasks: 0, done: 0, createdAt: new Date().toISOString() }, ...cur]);
      setName("");
      setShowModal(false);
    } catch {
      setProjects((cur) => [{ id: `p${Date.now()}`, name, tasks: 0, done: 0, createdAt: new Date().toISOString() }, ...cur]);
      setName("");
      setShowModal(false);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—";

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Projects</h1>
          <p className="page-subtitle">{projects.length} project{projects.length !== 1 ? "s" : ""} total</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} style={{ width: 16, height: 16 }}>
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          New Project
        </button>
      </div>

      {projects.length === 0 ? (
        <EmptyState
          title="No projects yet"
          description="Create your first project to start tracking and prioritizing tasks."
          action={<button className="btn btn-primary" onClick={() => setShowModal(true)}>Create Project</button>}
        />
      ) : (
        <div className="projects-grid">
          {projects.map((p) => {
            const pct = p.tasks ? Math.round((p.done / p.tasks) * 100) : 0;
            return (
              <Link key={p.id} to={`/projects/${p.id}`} className="project-card">
                <div>
                  <div className="project-card-icon"><FolderIcon /></div>
                </div>
                <div>
                  <div className="project-card-name">{p.name}</div>
                  <div className="project-card-date">Created {formatDate(p.createdAt)}</div>
                </div>
                <div className="project-card-stats">
                  <div className="project-card-stat">
                    <div className="project-card-stat-num">{p.tasks}</div>
                    <div className="project-card-stat-label">Tasks</div>
                  </div>
                  <div className="project-card-stat">
                    <div className="project-card-stat-num">{p.done}</div>
                    <div className="project-card-stat-label">Done</div>
                  </div>
                  <div className="project-card-stat">
                    <div className="project-card-stat-num">{pct}%</div>
                    <div className="project-card-stat-label">Complete</div>
                  </div>
                </div>
                <div>
                  <div className="project-progress-bar">
                    <div className="project-progress-fill" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Create New Project"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={createProject} disabled={loading || !name.trim()}>
              {loading ? <><div className="spinner spinner-sm" /> Creating…</> : "Create Project"}
            </button>
          </>
        }
      >
        <div className="create-project-form">
          <div className="form-group">
            <label className="form-label">Project Name *</label>
            <input
              className="form-control"
              placeholder="e.g. Backend API v3"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && createProject()}
              autoFocus
            />
          </div>
          <p style={{ fontSize: "var(--font-size-xs)", color: "var(--text-muted)" }}>
            A project groups related tasks together. You can add tasks and set priorities after creation.
          </p>
        </div>
      </Modal>
    </div>
  );
}
