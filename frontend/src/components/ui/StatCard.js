import React from "react";
import "./StatCard.css";

export default function StatCard({ label, value, icon, color, bgColor, trend, trendLabel }) {
  const trendDir =
    trend > 0 ? "up" : trend < 0 ? "down" : "neutral";

  return (
    <div
      className="stat-card"
      style={{
        "--stat-color": color || "var(--color-primary)",
        "--stat-bg": bgColor || "var(--color-primary-glow)",
      }}
    >
      <div className="stat-card-header">
        <div className="stat-card-icon">{icon}</div>
        {trendLabel !== undefined && (
          <span className={`stat-card-trend ${trendDir}`}>
            {trendDir === "up" && "↑"}
            {trendDir === "down" && "↓"}
            {trendDir === "neutral" && "→"}
            {trendLabel}
          </span>
        )}
      </div>
      <div>
        <div className="stat-card-value">{value ?? "—"}</div>
        <div className="stat-card-label">{label}</div>
      </div>
    </div>
  );
}
