// src/pages/Onboarding.js
import React, { useState } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import "./styles/Onboarding.css";

const STEPS = [
  { label: "Personal", title: "Personal Info", desc: "Tell us about you" },
  { label: "Skills", title: "Skills & Experience", desc: "What are your strengths?" },
  { label: "Availability", title: "Availability", desc: "How do you work best?" },
];

const INITIAL_FORM = {
  name: "", title: "", department: "", location: "", timezone: "",
  yearsTotal: "", availabilityHoursPerWeek: "40", skillsCsv: "",
  preferences: "", certifications: "",
};

export default function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(INITIAL_FORM);
  const [loading, setLoading] = useState(false);

  const onChange = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const next = () => setStep((s) => Math.min(s + 1, STEPS.length - 1));
  const back = () => setStep((s) => Math.max(s - 1, 0));

  const submit = async () => {
    setLoading(true);
    try {
      await api.post("/profile/complete", {
        name: form.name,
        title: form.title,
        department: form.department,
        location: form.location,
        timezone: form.timezone,
        yearsTotal: Number(form.yearsTotal || 0),
        availabilityHoursPerWeek: Number(form.availabilityHoursPerWeek || 40),
        skills: form.skillsCsv.split(",").map((s) => s.trim()).filter(Boolean),
        preferences: form.preferences.split(",").map((s) => s.trim()).filter(Boolean),
        certifications: form.certifications.split(",").map((s) => s.trim()).filter(Boolean),
      });
      navigate("/");
    } catch (err) {
      console.error("Onboarding error", err);
      alert("Failed to save profile. You can continue anyway.");
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  const progressPct = ((step + 1) / STEPS.length) * 100;

  return (
    <div className="onboarding-page">
      <div className="onboarding-card">
        {/* Header */}
        <div className="onboarding-header">
          <div className="onboarding-steps">
            {STEPS.map((s, i) => (
              <React.Fragment key={s.label}>
                <div className={`onboarding-step-dot${i === step ? " active" : i < step ? " done" : ""}`}>
                  <div className="onboarding-step-num">
                    {i < step ? (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} style={{ width: 12, height: 12 }}>
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    ) : i + 1}
                  </div>
                  {s.label}
                </div>
                {i < STEPS.length - 1 && <div className="onboarding-step-connector" />}
              </React.Fragment>
            ))}
          </div>
          <h2>{STEPS[step].title}</h2>
          <p>{STEPS[step].desc}</p>
          <div className="onboarding-progress-bar">
            <div className="onboarding-progress-fill" style={{ width: `${progressPct}%` }} />
          </div>
        </div>

        {/* Body */}
        <div className="onboarding-body">
          {step === 0 && (
            <div className="onboarding-form-grid">
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input className="form-control" placeholder="Jane Smith" value={form.name} onChange={onChange("name")} required />
              </div>
              <div className="form-group">
                <label className="form-label">Job Title</label>
                <input className="form-control" placeholder="Senior Engineer" value={form.title} onChange={onChange("title")} />
              </div>
              <div className="form-group">
                <label className="form-label">Department</label>
                <input className="form-control" placeholder="Engineering" value={form.department} onChange={onChange("department")} />
              </div>
              <div className="form-group">
                <label className="form-label">Location</label>
                <input className="form-control" placeholder="San Francisco, CA" value={form.location} onChange={onChange("location")} />
              </div>
              <div className="form-group span-2">
                <label className="form-label">Timezone</label>
                <input className="form-control" placeholder="America/Los_Angeles" value={form.timezone} onChange={onChange("timezone")} />
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="onboarding-form-grid">
              <div className="form-group span-2">
                <label className="form-label">Skills (comma separated)</label>
                <input className="form-control" placeholder="React, Java, MongoDB, REST APIs" value={form.skillsCsv} onChange={onChange("skillsCsv")} />
              </div>
              <div className="form-group">
                <label className="form-label">Years of Experience</label>
                <input type="number" min="0" max="50" className="form-control" placeholder="5" value={form.yearsTotal} onChange={onChange("yearsTotal")} />
              </div>
              <div className="form-group">
                <label className="form-label">Certifications</label>
                <input className="form-control" placeholder="AWS, GCP, PMP" value={form.certifications} onChange={onChange("certifications")} />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="onboarding-form-grid">
              <div className="form-group">
                <label className="form-label">Hours Available / Week</label>
                <input type="number" min="1" max="80" className="form-control" placeholder="40" value={form.availabilityHoursPerWeek} onChange={onChange("availabilityHoursPerWeek")} />
              </div>
              <div className="form-group">
                <label className="form-label">Work Preferences</label>
                <input className="form-control" placeholder="Remote, async, morning shifts" value={form.preferences} onChange={onChange("preferences")} />
              </div>
              <div className="form-group span-2">
                <label className="form-label" style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Profile Preview</span>
                </label>
                <div style={{ background: "var(--bg-surface-2)", borderRadius: "var(--radius-md)", padding: "var(--space-4)", fontSize: "var(--font-size-sm)", color: "var(--text-secondary)", lineHeight: 1.7 }}>
                  <strong style={{ color: "var(--text-primary)" }}>{form.name || "Your Name"}</strong> · {form.title || "Job Title"} · {form.department || "Department"}
                  <br />
                  {form.location} · {form.timezone}
                  <br />
                  Skills: <em>{form.skillsCsv || "—"}</em>
                  <br />
                  {form.availabilityHoursPerWeek}h/week · {form.yearsTotal || 0} yrs experience
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="onboarding-footer">
          <button className="btn btn-secondary" onClick={back} disabled={step === 0}>
            ← Back
          </button>
          <span style={{ fontSize: "var(--font-size-xs)", color: "var(--text-muted)" }}>
            Step {step + 1} of {STEPS.length}
          </span>
          {step < STEPS.length - 1 ? (
            <button className="btn btn-primary" onClick={next}>
              Next →
            </button>
          ) : (
            <button className="btn btn-primary" onClick={submit} disabled={loading}>
              {loading ? <><div className="spinner spinner-sm" /> Saving…</> : "Complete Setup ✓"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
