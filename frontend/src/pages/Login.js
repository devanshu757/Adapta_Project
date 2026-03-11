// src/pages/Login.js
import React, { useState } from "react";
import { auth } from "../services/firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import "./styles/Login.css";

const FEATURES = [
  {
    title: "Smart Prioritization",
    desc: "AI-powered scoring based on impact, effort, and risk.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
  },
  {
    title: "Real-time Analytics",
    desc: "Track completion rates and workload distribution.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <path d="M3 3v18h18" /><path d="m19 9-5 5-4-4-3 3" />
      </svg>
    ),
  },
  {
    title: "Team Formation",
    desc: "Match the right people to the right tasks by skill.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
];

export default function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const signInWithGoogle = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      navigate("/");
    } catch (err) {
      console.error("Sign-in failed", err);
      alert("Sign-in failed. Check console.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* Brand Panel */}
      <div className="login-brand">
        <div className="login-brand-logo">
          <div className="login-brand-logo-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2}>
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          </div>
          <span className="login-brand-logo-text">Adapta</span>
        </div>

        <div className="login-brand-tagline">
          <h1>
            Prioritize work.<br />
            <span>Deliver faster.</span>
          </h1>
          <p>
            Adapta automatically ranks your tasks by deadline, workload,
            and importance — so your team always works on what matters most.
          </p>
        </div>

        <div className="login-features">
          {FEATURES.map((f) => (
            <div key={f.title} className="login-feature">
              <div className="login-feature-icon">{f.icon}</div>
              <div>
                <strong style={{ color: "white", fontSize: "var(--font-size-sm)" }}>{f.title}</strong>
                <div style={{ fontSize: "var(--font-size-xs)", opacity: 0.75 }}>{f.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Auth Panel */}
      <div className="login-auth">
        <div className="login-auth-header">
          <h2>Welcome back 👋</h2>
          <p>Sign in to your Adapta workspace to manage and prioritize your team's work.</p>
        </div>

        <button
          className={`login-google-btn${loading ? " loading" : ""}`}
          onClick={signInWithGoogle}
          disabled={loading}
        >
          {loading ? (
            <div className="spinner spinner-sm" />
          ) : (
            <svg className="login-google-icon" viewBox="0 0 48 48">
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v8.51h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.14z" />
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
            </svg>
          )}
          {loading ? "Signing in…" : "Continue with Google"}
        </button>

        <div className="login-divider">or</div>

        <p style={{ fontSize: "var(--font-size-sm)", color: "var(--text-muted)", textAlign: "center" }}>
          More sign-in options coming soon.
        </p>

        <p className="login-footer-text">
          By continuing, you agree to Adapta's Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}
