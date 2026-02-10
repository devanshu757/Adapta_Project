// src/App.js
import React from "react";
import { Routes, Route, Link } from "react-router-dom";

// NOTE: these imports assume your files are in src/components/ and src/ root
import AuthGate from "./components/AuthGate";
import Login from "./pages/Login";
import Onboarding from "./pages/Onboarding";
import Projects from "./pages/Projects";
import ProjectDetail from "./pages/ProjectDetail";
import Dashboard from "./pages/Dashboard";
import Analytics from "./pages/Analytics";
import TeamFormation from "./pages/TeamFormation";

export default function App() {
  return (
    <div>
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
        <div className="container">
          <Link className="navbar-brand" to="/">Adapta</Link>

          <div className="collapse navbar-collapse">
            <ul className="navbar-nav me-auto">
              <li className="nav-item"><Link className="nav-link" to="/">Dashboard</Link></li>
              <li className="nav-item"><Link className="nav-link" to="/projects">Projects</Link></li>
              <li className="nav-item"><Link className="nav-link" to="/analytics">Analytics</Link></li>
              <li className="nav-item"><Link className="nav-link" to="/team">Team</Link></li>
            </ul>
          </div>
        </div>
      </nav>

      <main className="container my-4">
        <AuthGate>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/projects/:id" element={<ProjectDetail />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/team" element={<TeamFormation />} />
            <Route path="/" element={<Dashboard />} />
          </Routes>
        </AuthGate>
      </main>

      <footer className="bg-light text-center py-3 mt-5">
        <div className="container">© {new Date().getFullYear()} Adapta</div>
      </footer>
    </div>
  );
}
