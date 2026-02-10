// src/Analytics.js
import React, { useEffect, useState } from "react";
import api from "../services/api";
import "./styles/Analytics.css";

export default function Analytics() {
  const [kpis, setKpis] = useState(null);

  useEffect(() => { fetchKpis(); }, []);

  const fetchKpis = async () => {
    try {
      const res = await api.get("/analytics/kpis");
      setKpis(res?.data || null);
    } catch (err) { console.error(err); alert("Failed to load analytics"); }
  };

  return (
    <div>
      <h2 className="mb-3">Analytics</h2>
      {!kpis ? <div>Loading...</div> : (
        <div className="row">
          <div className="col-md-3 mb-2"><div className="card p-3"><h5>Total tasks</h5><div className="display-6">{kpis.total_tasks}</div></div></div>
          <div className="col-md-3 mb-2"><div className="card p-3"><h5>Done</h5><div className="display-6">{kpis.done}</div></div></div>
          <div className="col-md-3 mb-2"><div className="card p-3"><h5>In progress</h5><div className="display-6">{kpis.in_progress}</div></div></div>
          <div className="col-md-3 mb-2"><div className="card p-3"><h5>Todo</h5><div className="display-6">{kpis.todo}</div></div></div>
        </div>
      )}
    </div>
  );
}
