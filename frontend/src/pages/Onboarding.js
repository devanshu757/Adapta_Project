// src/Onboarding.js
import React, { useState } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";

export default function Onboarding() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "", title: "", department: "", location: "", timezone: "",
    yearsTotal: 0, availabilityHoursPerWeek: 40, skillsCsv: ""
  });
  const [loading, setLoading] = useState(false);

  const onChange = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        name: form.name,
        title: form.title,
        department: form.department,
        location: form.location,
        timezone: form.timezone,
        yearsTotal: Number(form.yearsTotal || 0),
        availabilityHoursPerWeek: Number(form.availabilityHoursPerWeek || 0),
        skills: form.skillsCsv.split(",").map(s => s.trim()).filter(Boolean),
        preferences: [],
        certifications: []
      };
      await api.post("/profile/complete", payload);
      navigate("/");
    } catch (err) {
      console.error("Onboarding error", err);
      alert("Failed to save profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card mx-auto" style={{ maxWidth: 800 }}>
      <div className="card-body">
        <h4 className="card-title">Complete your profile</h4>
        <form onSubmit={submit}>
          <div className="row">
            <div className="col-md-6 mb-2"><input className="form-control" placeholder="Name" value={form.name} onChange={onChange('name')} required /></div>
            <div className="col-md-6 mb-2"><input className="form-control" placeholder="Title" value={form.title} onChange={onChange('title')} /></div>
            <div className="col-md-6 mb-2"><input className="form-control" placeholder="Department" value={form.department} onChange={onChange('department')} /></div>
            <div className="col-md-6 mb-2"><input className="form-control" placeholder="Location" value={form.location} onChange={onChange('location')} /></div>
            <div className="col-md-6 mb-2"><input className="form-control" placeholder="Timezone" value={form.timezone} onChange={onChange('timezone')} /></div>
            <div className="col-md-3 mb-2"><input type="number" className="form-control" placeholder="Years Exp" value={form.yearsTotal} onChange={onChange('yearsTotal')} /></div>
            <div className="col-md-3 mb-2"><input type="number" className="form-control" placeholder="Hours/week" value={form.availabilityHoursPerWeek} onChange={onChange('availabilityHoursPerWeek')} /></div>
            <div className="col-12 mb-2"><input className="form-control" placeholder="Skills (comma separated)" value={form.skillsCsv} onChange={onChange('skillsCsv')} /></div>
          </div>
          <button className="btn btn-primary mt-2" disabled={loading}>{loading ? "Saving..." : "Save profile"}</button>
        </form>
      </div>
    </div>
  );
}
