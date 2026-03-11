import React from "react";
import { useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import "./Layout.css";

const PAGE_TITLES = {
  "/": "Dashboard",
  "/projects": "Projects",
  "/analytics": "Analytics",
  "/team": "Team Formation",
};

function Topbar({ pageTitle }) {
  const now = new Date();
  const dateStr = now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  return (
    <header className="topbar">
      <div className="topbar-title">{pageTitle}</div>
      <div className="topbar-actions">
        <span className="topbar-date">{dateStr}</span>
        <button className="topbar-icon-btn" title="Notifications">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          <span className="topbar-notification-dot" />
        </button>
        <button className="topbar-icon-btn" title="Settings">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        </button>
      </div>
    </header>
  );
}

export default function Layout({ children, user }) {
  const location = useLocation();
  const pageTitle =
    PAGE_TITLES[location.pathname] ||
    (location.pathname.startsWith("/projects/") ? "Project Detail" : "Adapta");

  return (
    <div className="layout">
      <Sidebar user={user} />
      <div className="layout-main">
        <Topbar pageTitle={pageTitle} />
        <main className="layout-content animate-fade-in">{children}</main>
      </div>
    </div>
  );
}
