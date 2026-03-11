import React from "react";

/**
 * SVG donut ring showing a percentage value.
 * size: pixel diameter (default 80)
 * stroke: ring thickness (default 8)
 * color: ring color (default primary)
 */
export default function ProgressRing({
  percent = 0,
  size = 80,
  stroke = 8,
  color = "var(--color-primary)",
  trackColor = "var(--border-color)",
  label,
  sublabel,
}) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const filled = ((percent || 0) / 100) * circ;

  return (
    <div style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", gap: "var(--space-2)" }}>
      <div style={{ position: "relative", width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={trackColor}
            strokeWidth={stroke}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeDasharray={`${filled} ${circ - filled}`}
            strokeLinecap="round"
            style={{ transition: "stroke-dasharray 0.6s ease" }}
          />
        </svg>
        {label !== undefined && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span style={{ fontSize: size < 70 ? 12 : 15, fontWeight: 700, color: "var(--text-primary)", lineHeight: 1 }}>
              {label}
            </span>
            {sublabel && (
              <span style={{ fontSize: 10, color: "var(--text-muted)" }}>{sublabel}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
