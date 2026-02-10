// src/TeamFormation.js
import React, { useState } from "react";
import api from "../services/api";

export default function TeamFormation() {
  const [skills, setSkills] = useState("");
  const [size, setSize] = useState(3);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(false);

  const suggest = async () => {
    const skillsList = skills.split(",").map(s => s.trim()).filter(Boolean);
    if (skillsList.length === 0) return alert("Enter at least one skill");
    setLoading(true);
    try {
      const requiredSkills = {};
      skillsList.forEach(s => requiredSkills[s] = 1);
      const res = await api.post("/teams/suggest", { requiredSkills, sizeLimit: Number(size || 3) });
      setCandidates(res?.data || []);
    } catch (err) { console.error(err); alert("Failed to get suggestions"); } finally { setLoading(false); }
  };

  return (
    <div>
      <h2 className="mb-3">Team Formation</h2>
      <div className="mb-3">
        <input className="form-control mb-2" placeholder="Required skills (comma separated)" value={skills} onChange={e=>setSkills(e.target.value)} />
        <div className="d-flex gap-2">
          <input type="number" min="1" max="10" className="form-control w-auto" value={size} onChange={e=>setSize(e.target.value)} />
          <button className="btn btn-primary" onClick={suggest} disabled={loading}>{loading ? "Suggesting..." : "Suggest Team"}</button>
        </div>
      </div>

      <div>
        <h5>Candidates</h5>
        <ul className="list-group">
          {candidates.map(c => (
            <li key={c.id || c.email} className="list-group-item d-flex justify-content-between align-items-center">
              <div>
                <div className="fw-bold">{c.name || c.email}</div>
                <small className="text-muted">{c.email}</small>
              </div>
              <div>score: <span className="badge bg-secondary">{c.score ?? "n/a"}</span></div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
