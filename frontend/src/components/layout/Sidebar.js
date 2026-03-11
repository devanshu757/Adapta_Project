import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { auth } from "../../services/firebase";
import "./Sidebar.css";

const NAV_ITEMS = [
  {
    section: "Main",
    items: [
      {
        to: "/",
        label: "Dashboard",
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="7" height="7" rx="1" />
          </svg>
        ),
      },
      {
        to: "/projects",
        label: "Projects",
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M2 7a2 2 0 0 1 2-2h4l2 3h10a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2z" />
          </svg>
        ),
      },
      {
        to: "/analytics",
        label: "Analytics",
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M3 3v18h18" />
            <path d="m19 9-5 5-4-4-3 3" />
          </svg>
        ),
      },
      {
        to: "/team",
        label: "Team",
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        ),
      },
    ],
  },
];

export default function Sidebar({ user }) {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await auth.signOut();
      navigate("/login");
    } catch (err) {
      console.error("Sign out failed", err);
    }
  };

  const initials = user?.displayName
    ? user.displayName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : user?.email?.[0]?.toUpperCase() || "U";

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2}>
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        </div>
        <span className="sidebar-logo-text">
          Adapt<span>a</span>
        </span>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {NAV_ITEMS.map((group) => (
          <React.Fragment key={group.section}>
            <span className="sidebar-section-label">{group.section}</span>
            {group.items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }) => `sidebar-link${isActive ? " active" : ""}`}
              >
                <span className="sidebar-link-icon">{item.icon}</span>
                {item.label}
                {item.badge && <span className="sidebar-link-badge">{item.badge}</span>}
              </NavLink>
            ))}
          </React.Fragment>
        ))}
      </nav>

      {/* User footer */}
      <div className="sidebar-footer">
        <div className="sidebar-user" onClick={handleSignOut} title="Sign out">
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              background: "linear-gradient(135deg, var(--color-primary), var(--color-accent))",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 12,
              fontWeight: 700,
              color: "white",
              flexShrink: 0,
              overflow: "hidden",
            }}
          >
            {user?.photoURL ? (
              <img src={user.photoURL} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              initials
            )}
          </div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{user?.displayName || "User"}</div>
            <div className="sidebar-user-email">{user?.email || ""}</div>
          </div>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={{ width: 14, height: 14, color: "var(--sidebar-text)", flexShrink: 0 }}>
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
        </div>
      </div>
    </aside>
  );
}
