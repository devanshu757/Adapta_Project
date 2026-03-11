// src/App.js
import React, { useEffect, useState } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { auth } from "./services/firebase";

import Layout from "./components/layout/Layout";
import Login from "./pages/Login";
import Onboarding from "./pages/Onboarding";
import Projects from "./pages/Projects";
import ProjectDetail from "./pages/ProjectDetail";
import Dashboard from "./pages/Dashboard";
import Analytics from "./pages/Analytics";
import TeamFormation from "./pages/TeamFormation";
import api from "./services/api";

// Full-screen loading spinner shown while auth resolves
function LoadingScreen() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--bg-base)",
        gap: "var(--space-4)",
      }}
    >
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: 12,
          background: "linear-gradient(135deg, var(--color-primary), var(--color-accent))",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 4px 16px var(--color-primary-glow)",
        }}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2.2} style={{ width: 26, height: 26 }}>
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      </div>
      <div className="spinner" />
      <span style={{ fontSize: "var(--font-size-sm)", color: "var(--text-muted)" }}>Loading Adapta…</span>
    </div>
  );
}

// Pages that skip the layout shell (full-screen)
const BARE_PATHS = ["/login", "/onboarding"];

export default function App() {
  const [user, setUser] = useState(undefined);   // undefined = still loading
  const [hasProfile, setHasProfile] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(async (firebaseUser) => {
      if (!firebaseUser) {
        setUser(null);
        if (!BARE_PATHS.includes(location.pathname)) navigate("/login");
        return;
      }
      setUser(firebaseUser);
      try {
        const res = await api.get("/auth/me");
        if (!res?.data?.hasProfile) {
          setHasProfile(false);
          navigate("/onboarding");
        } else {
          setHasProfile(true);
        }
      } catch {
        // Backend not running — still allow frontend browsing
        setHasProfile(true);
      }
    });
    return unsub;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Auth still resolving
  if (user === undefined) return <LoadingScreen />;

  const isBare = BARE_PATHS.includes(location.pathname);

  if (isBare) {
    return (
      <Routes>
        <Route path="/login"      element={<Login />} />
        <Route path="/onboarding" element={<Onboarding />} />
      </Routes>
    );
  }

  return (
    <Layout user={user}>
      <Routes>
        <Route path="/"              element={<Dashboard />} />
        <Route path="/projects"      element={<Projects />} />
        <Route path="/projects/:id"  element={<ProjectDetail />} />
        <Route path="/analytics"     element={<Analytics />} />
        <Route path="/team"          element={<TeamFormation />} />
        {/* Fallback */}
        <Route path="*"              element={<Dashboard />} />
      </Routes>
    </Layout>
  );
}
