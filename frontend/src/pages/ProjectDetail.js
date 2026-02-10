// src/ProjectDetail.js
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";
import "./styles/ProjectDetail.css";

export default function ProjectDetail() {
  const { id: projectId } = useParams();
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [impact, setImpact] = useState(5);
  const [effort, setEffort] = useState(5);
  const [risk, setRisk] = useState(5);
  const [loading, setLoading] = useState(false);

  const [generateDetails, setGenerateDetails] = useState(false);
  const [seedPrompt, setSeedPrompt] = useState("");

  useEffect(() => { fetchTasks(); }, [projectId]);

  const fetchTasks = async () => {
    try {
      try {
        const res = await api.get(`/projects/${projectId}/tasks`);
        if (res?.data) { setTasks(res.data.map(normalizeTask)); return; }
      } catch (_) {}
      const res = await api.get("/tasks");
      const filtered = (res?.data || []).map(normalizeTask).filter(t => String(t.projectId) === String(projectId));
      filtered.sort((a,b)=> (b.priority||0)-(a.priority||0));
      setTasks(filtered);
    } catch (err) { console.error(err); alert("Failed to load tasks"); }
  };

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

  const createTask = async (e) => {
    e.preventDefault();
    if (!title) return alert("Enter title");
    setLoading(true);
    try {
      const payload = { projectId, title, impact: Number(impact), effort: Number(effort), risk: Number(risk), generateDetails: generateDetails, seedPrompt };
      await api.post("/tasks", payload);
      await api.put("/tasks/prioritize");
      await fetchTasks();
      setTitle(""); setSeedPrompt(""); setGenerateDetails(false);
    } catch (err) { console.error(err); alert("Create failed"); } finally { setLoading(false); }
  };

  return (
    <div>
      <h2 className="project-detail-title mb-3">Project Tasks</h2>

      <form className="row g-2 mb-3" onSubmit={createTask}>
        <div className="col-lg-5">
          <input className="form-control" placeholder="Task title" value={title} onChange={e=>setTitle(e.target.value)} required />
        </div>
        <div className="col-auto">
          <input type="number" className="form-control" min="1" max="10" value={impact} onChange={e=>setImpact(e.target.value)} />
        </div>
        <div className="col-auto">
          <input type="number" className="form-control" min="1" max="10" value={effort} onChange={e=>setEffort(e.target.value)} />
        </div>
        <div className="col-auto">
          <input type="number" className="form-control" min="1" max="10" value={risk} onChange={e=>setRisk(e.target.value)} />
        </div>
        <div className="col-auto d-flex align-items-center">
          <div className="form-check">
            <input className="form-check-input" type="checkbox" checked={generateDetails} onChange={e=>setGenerateDetails(e.target.checked)} id="aiGen" />
            <label className="form-check-label" htmlFor="aiGen">Auto-generate description (AI)</label>
          </div>
        </div>
        <div className="col-auto">
          <button className="btn btn-primary" type="submit" disabled={loading}>{loading ? "Adding..." : "Add Task"}</button>
        </div>

        {generateDetails && (
          <div className="col-12 mt-2">
            <input className="form-control" placeholder="Optional AI instruction (short)" value={seedPrompt} onChange={e=>setSeedPrompt(e.target.value)} />
          </div>
        )}
      </form>

      <div className="table-responsive">
        <table className="table table-bordered table-hover">
          <thead className="table-light">
            <tr>
              <th>Title</th>
              <th>Description</th>
              <th>Impact</th>
              <th>Effort</th>
              <th>Risk</th>
              <th>Priority</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map(t => (
              <tr key={t.id || JSON.stringify(t)}>
                <td>{t.title}</td>
                <td style={{ maxWidth: 420, whiteSpace: 'normal' }}>{t.description || "—"}</td>
                <td>{t.impact}</td>
                <td>{t.effort}</td>
                <td>{t.risk}</td>
                <td>{t.priority}</td>
                <td>{t.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
