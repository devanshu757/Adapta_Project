// src/pages/TeamFormation.js
import React, { useState } from "react";
import api from "../services/api";
import "./styles/TeamFormation.css";
import EmptyState from "../components/ui/EmptyState";

const MOCK_CANDIDATES = [
  { id: "u1", name: "Sarah Chen", email: "sarah@adapta.io", skills: ["React", "TypeScript", "Java"], score: 94, score_label: "95%" },
  { id: "u2", name: "Marcus Lloyd", email: "marcus@adapta.io", skills: ["Java", "Spring Boot", "MongoDB"], score: 87, score_label: "87%" },
  { id: "u3", name: "Priya Nair", email: "priya@adapta.io", skills: ["React", "CSS", "REST APIs"], score: 82, score_label: "82%" },
];

const AVATAR_COLORS = ["#6366f1", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#3b82f6"];

function getInitials(name) {
  return (name || "?").split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

export default function TeamFormation() {
  const [skillInput, setSkillInput] = useState("");
  const [skills, setSkills] = useState(["React", "Java"]);
  const [size, setSize] = useState(3);
  const [candidates, setCandidates] = useState(MOCK_CANDIDATES);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const addSkill = (e) => {
    if ((e.key === "Enter" || e.key === ",") && skillInput.trim()) {
      e.preventDefault();
      const newSkill = skillInput.trim().replace(/,$/, "");
      if (!skills.includes(newSkill)) setSkills((s) => [...s, newSkill]);
      setSkillInput("");
    }
  };

  const removeSkill = (s) => setSkills((cur) => cur.filter((x) => x !== s));

  const suggest = async () => {
    if (skills.length === 0) return;
    setLoading(true);
    setSearched(true);
    try {
      const requiredSkills = {};
      skills.forEach((s) => (requiredSkills[s] = 1));
      const res = await api.post("/teams/suggest", { requiredSkills, sizeLimit: Number(size) });
      const data = res?.data || [];
      setCandidates(data.length > 0 ? data : MOCK_CANDIDATES);
    } catch {
      setCandidates(MOCK_CANDIDATES);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Team Formation</h1>
          <p className="page-subtitle">Find the best people for any project</p>
        </div>
      </div>

      <div className="team-layout">
        {/* Search panel */}
        <div className="team-search-panel">
          <div className="team-search-header">
            <h2>Find Team Members</h2>
            <p>Enter required skills and team size to get AI-ranked candidates</p>
          </div>
          <div className="team-search-body">
            {/* Skill tag input */}
            <div className="form-group">
              <label className="form-label">Required Skills</label>
              <div className="skill-tag-input" onClick={() => document.getElementById("skill-input").focus()}>
                {skills.map((s) => (
                  <span key={s} className="chip">
                    {s}
                    <button className="chip-remove" onClick={() => removeSkill(s)}>×</button>
                  </span>
                ))}
                <input
                  id="skill-input"
                  className="skill-tag-inner"
                  placeholder={skills.length === 0 ? "Type skill + Enter" : "+ Add skill"}
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={addSkill}
                />
              </div>
              <p style={{ fontSize: "var(--font-size-xs)", color: "var(--text-muted)", marginTop: 4 }}>
                Press <kbd style={{ background: "var(--bg-surface-2)", padding: "1px 5px", borderRadius: 3, border: "1px solid var(--border-color)", fontSize: 10 }}>Enter</kbd> to add a skill
              </p>
            </div>

            {/* Team size slider */}
            <div className="form-group">
              <label className="form-label">Team Size</label>
              <div className="team-size-display">
                <span style={{ fontSize: "var(--font-size-sm)", color: "var(--text-secondary)" }}>1 person</span>
                <div className="team-size-number">{size}</div>
                <span style={{ fontSize: "var(--font-size-sm)", color: "var(--text-secondary)" }}>10 people</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={size}
                onChange={(e) => setSize(Number(e.target.value))}
                className="form-range"
              />
            </div>

            <button
              className="btn btn-primary"
              style={{ width: "100%" }}
              onClick={suggest}
              disabled={loading || skills.length === 0}
            >
              {loading ? (
                <><div className="spinner spinner-sm" /> Finding matches…</>
              ) : (
                <>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={{ width: 16, height: 16 }}>
                    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                  Suggest Team ({size})
                </>
              )}
            </button>
          </div>
        </div>

        {/* Results panel */}
        <div className="candidates-panel">
          <div className="candidates-header">
            <span className="candidates-title">
              {searched ? `${candidates.length} Candidate${candidates.length !== 1 ? "s" : ""} Found` : "Suggested Candidates"}
            </span>
            {candidates.length > 0 && (
              <span className="badge badge-primary">{skills.join(", ")}</span>
            )}
          </div>

          {candidates.length === 0 ? (
            <EmptyState
              title="No candidates found"
              description="Try different skills or expand your search criteria."
            />
          ) : (
            candidates.map((c, i) => (
              <div key={c.id || c.email} className="candidate-card">
                <div
                  className="candidate-avatar"
                  style={{ background: AVATAR_COLORS[i % AVATAR_COLORS.length] }}
                >
                  {c.photoURL
                    ? <img src={c.photoURL} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }} />
                    : getInitials(c.name || c.email)
                  }
                </div>
                <div className="candidate-info">
                  <div className="candidate-name">{c.name || c.email}</div>
                  <div className="candidate-email">{c.email}</div>
                  <div className="candidate-skills">
                    {(c.skills || []).slice(0, 4).map((s) => (
                      <span key={s} className={`chip${skills.includes(s) ? "" : ""}`}
                        style={{ background: skills.includes(s) ? "var(--color-success-light)" : "var(--color-primary-glow)", color: skills.includes(s) ? "var(--color-success)" : "var(--color-primary)" }}>
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="candidate-score">
                  <div className="candidate-score-num">{c.score ?? c.score_label ?? "—"}</div>
                  <div className="candidate-score-label">Match</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
