// src/Projects.js
import React, { useEffect, useState } from "react";
import api from "../services/api";
import { Link } from "react-router-dom";
import "./styles/Projects.css";

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchProjects(); }, []);

  const fetchProjects = async () => {
    try {
      const res = await api.get("/projects");
      const list = (res?.data || []).map(p => ({ id: p.id || p._id || p.Id, ...p }));
      setProjects(list.filter(p => p.id));
    } catch (err) { console.error(err); alert("Failed to load projects"); }
  };

  const createProject = async () => {
    if (!name) return alert("Enter project name");
    setLoading(true);
    try {
      const res = await api.post("/projects", { name });
      const p = res?.data; const id = p?.id || p?._id || p?.Id;
      setProjects(cur => [{ id, ...p }, ...cur]);
      setName("");
    } catch (err) { console.error(err); alert("Create failed"); } finally { setLoading(false); }
  };

  return (
    <div>
      <h2 className="projects-title">Projects</h2>
      <div className="mb-3 d-flex">
        <input className="form-control me-2" value={name} onChange={e => setName(e.target.value)} placeholder="New project name" />
        <button className="btn btn-primary" onClick={createProject} disabled={loading}>{loading ? "Creating..." : "Create"}</button>
      </div>

      <ul className="project-list list-unstyled">
        {projects.map(p => (
          <li key={p.id} className="mb-2 p-2 border rounded bg-white">
            <Link to={`/projects/${p.id}`} className="text-decoration-none">{p.name || "Untitled"}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
