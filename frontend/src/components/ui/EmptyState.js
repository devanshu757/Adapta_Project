import React from "react";

export default function EmptyState({ icon, title, description, action }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "var(--space-16) var(--space-8)",
        textAlign: "center",
      }}
    >
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: "var(--radius-xl)",
          background: "var(--color-primary-glow)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "var(--space-5)",
          color: "var(--color-primary)",
        }}
      >
        {icon || (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} style={{ width: 32, height: 32 }}>
            <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414a1 1 0 0 1 .293.707V19a2 2 0 0 1-2 2z" />
          </svg>
        )}
      </div>
      <h3
        style={{
          fontSize: "var(--font-size-lg)",
          fontWeight: "var(--font-weight-semibold)",
          color: "var(--text-primary)",
          marginBottom: "var(--space-2)",
        }}
      >
        {title || "Nothing here yet"}
      </h3>
      {description && (
        <p
          style={{
            fontSize: "var(--font-size-sm)",
            color: "var(--text-muted)",
            maxWidth: 320,
            lineHeight: 1.6,
            marginBottom: action ? "var(--space-6)" : 0,
          }}
        >
          {description}
        </p>
      )}
      {action}
    </div>
  );
}
