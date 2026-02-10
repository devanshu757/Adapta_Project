// src/AuthGate.js
import React, { useEffect, useState } from "react";
import { auth } from "../services/firebase";
import api from "../services/api";
import { useNavigate } from "react-router-dom";

export default function AuthGate({ children }) {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    const unsub = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        if (mounted) {
          setLoading(false);
          navigate("/login");
        }
        return;
      }
      try {
        await user.getIdToken(); // ensure token is ready
        const res = await api.get("/auth/me");
        const hasProfile = res?.data?.hasProfile;
        if (!hasProfile) navigate("/onboarding");
      } catch (err) {
        console.error("auth/me failed", err);
        navigate("/login");
      } finally {
        if (mounted) setLoading(false);
      }
    });
    return () => { mounted = false; unsub(); };
  }, [navigate]);

  if (loading) return <div className="text-center my-5">Loading...</div>;
  return children;
}
