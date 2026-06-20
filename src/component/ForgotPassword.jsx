import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API_BASE_URL from "../config/api.js";
import "../styles/ForgotPassword.css";

export default function ForgotPassword() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1); // 1: email, 2: OTP, 3: naya password
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  // ── Step 1: Email submit → OTP bhejo ──────────────────
  const handleSendOtp = async () => {
    setError("");
    if (!email.trim()) return setError("Email daalein");

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Kuch galat ho gaya");

      setInfo("OTP bhej diya gaya hai — apna inbox check karein");
      setStep(2);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2: OTP verify ────────────────────────────────
  const handleVerifyOtp = async () => {
    setError("");
    if (otp.trim().length !== 6) return setError("6 digit ka OTP daalein");

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), otp: otp.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Invalid OTP");

      setResetToken(data.resetToken);
      setInfo("");
      setStep(3);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  // ── Step 3: Naya password set karo ────────────────────
  const handleResetPassword = async () => {
    setError("");
    if (newPassword.length < 6)
      return setError("Password kam se kam 6 characters ka hona chahiye");
    if (newPassword !== confirmPassword)
      return setError("Password match nahi kar raha");

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resetToken, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Kuch galat ho gaya");

      setInfo("Password reset ho gaya! Login page pe le ja rahe hain...");
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
          <span className="fp-step-line" />
          <span className={step >= 3 ? "fp-step active" : "fp-step"}>3</span>
        </div>

        {error && <p className="fp-error">{error}</p>}
        {info && <p className="fp-info">{info}</p>}

        {step === 1 && (
          <>
            <p className="fp-subtext">
              Apna registered email daalein, hum aapko OTP bhej denge.
            </p>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendOtp()}
            />
            <button className="fp-btn" onClick={handleSendOtp} disabled={loading}>
              {loading ? "Bhej rahe hain..." : "Send OTP"}
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <p className="fp-subtext">
              <strong>{email}</strong> pe bheja gaya 6-digit OTP daalein.
            </p>
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder="6-digit OTP"
              className="fp-otp-input"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              onKeyDown={(e) => e.key === "Enter" && handleVerifyOtp()}
            />
            <button className="fp-btn" onClick={handleVerifyOtp} disabled={loading}>
              {loading ? "Verify ho raha hai..." : "Verify OTP"}
            </button>
            <button
              className="fp-link-btn"
              onClick={() => { setStep(1); setOtp(""); setError(""); }}
            >
              Email change karein
            </button>
          </>
        )}

        {step === 3 && (
          <>
            <p className="fp-subtext">Apna naya password set karein.</p>
            <input
              type="password"
              placeholder="Naya password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <input
              type="password"
              placeholder="Naya password confirm karein"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleResetPassword()}
            />
            <button className="fp-btn" onClick={handleResetPassword} disabled={loading}>
              {loading ? "Set ho raha hai..." : "Reset Password"}
            </button>
          </>
        )}

        <Link to="/login" className="fp-back-link">
          ← Login pe wapas jayein
        </Link>
      </div>
    </div>
  );
}
