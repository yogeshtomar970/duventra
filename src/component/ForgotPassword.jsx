import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API_BASE_URL from "../config/api.js";
import "../styles/ForgotPassword.css";

export default function ForgotPassword() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1); // 1: email, 2: naya password
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  // ── Step 1: Email check ───────────────────────────────
  const handleCheckEmail = async () => {
    setError("");
    if (!email.trim()) return setError("Enter Email");

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/check-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Email not found");

      setStep(2);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2: Naya password set karo ────────────────────
  const handleResetPassword = async () => {
    setError("");
    if (newPassword.length < 6)
      return setError("The password must be at least 6 characters long.");
    if (newPassword !== confirmPassword)
      return setError("The password does not match.");

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "something went wrong");

      setInfo("Password reset! Redirecting to the login page...");
      setTimeout(() => navigate("/login"), 1800);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fp-container">
      <div className="fp-card">
        <h2>Forgot Password</h2>

        <div className="fp-steps">
          <span className={step >= 1 ? "fp-step active" : "fp-step"}>1</span>
          <span className="fp-step-line" />
          <span className={step >= 2 ? "fp-step active" : "fp-step"}>2</span>
        </div>

        {error && <p className="fp-error">{error}</p>}
        {info && <p className="fp-info">{info}</p>}

        {step === 1 && (
          <>
            <p className="fp-subtext">Enter your registered email.</p>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCheckEmail()}
            />
            <button className="fp-btn" onClick={handleCheckEmail} disabled={loading}>
              {loading ? "Checking" : "Continue"}
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <p className="fp-subtext">
             Set a new password for the <strong>{email}</strong>
            </p>
            <input
              type="password"
              placeholder="New password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <input
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleResetPassword()}
            />
            <button className="fp-btn" onClick={handleResetPassword} disabled={loading}>
              {loading ? "Setting up..." : "Reset Password"}
            </button>
            <button
              className="fp-link-btn"
              onClick={() => { setStep(1); setError(""); }}
            >
              Change email
            </button>
          </>
        )}

        <Link to="/login" className="fp-back-link">
          ← Back to login
        </Link>
      </div>
    </div>
  );
}
