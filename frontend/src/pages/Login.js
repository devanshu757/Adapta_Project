// src/Login.js
import React from "react";
import { auth } from "../services/firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import "./styles/Login.css";

export default function Login() {
  const navigate = useNavigate();

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      navigate("/");
    } catch (err) {
      console.error("Sign-in failed", err);
      alert("Sign-in failed. Check console.");
    }
  };

  return (
    <div className="login-container">
      <div className="login-card card mx-auto" style={{ maxWidth: 520 }}>
        <div className="card-body">
          <h3 className="card-title">Sign In</h3>
          <p>Use Google to sign in.</p>
          <button className="btn btn-outline-primary w-100" onClick={signInWithGoogle}>
            Sign in with Google
          </button>
        </div>
      </div>
    </div>
  );
}
