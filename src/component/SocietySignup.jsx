import API_BASE_URL from "../config/api.js";
import { useState } from "react";
import "../societysignup.css";
import { useNavigate } from "react-router-dom";

export default function SocietySignup() {
  const navigate = useNavigate();

  // ── Step 1: email verify ──
  const [step, setStep] = useState(1);
  const [emailInput, setEmailInput] = useState("");
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [verifyError, setVerifyError] = useState("");

  // ── Step 2: full form ──
  const [formData, setFormData] = useState({
    societyName: "",
    societyType: "",
    collegeName: "",
    coordinatorName: "",
    email: "",
    password: "",
    repassword: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ── Step 1 submit: verify email ──
  const handleVerifyEmail = async (e) => {
    e.preventDefault();
    setVerifyError("");
    setVerifyLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/society/verify-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailInput.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        // Pre-fill societyName and collegeName if available in DB
        setFormData((p) => ({
          ...p,
          email: emailInput.trim(),
          societyName: data.societyName || "",
          collegeName: data.collegeName || "",
        }));
        setStep(2);
      } else {
        setVerifyError(data.message || "Email verification failed");
      }
    } catch {
      setVerifyError("Server error. Please try again.");
    }
    setVerifyLoading(false);
  };

  // ── Step 2 submit: signup ──
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/api/society/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const result = await res.json();
      if (res.ok) {
        alert(result.message || "Society signup successful");
        navigate("/login");
      } else {
        alert(result.message || "Signup failed");
      }
    } catch {
      alert("Server error");
    }
  };

  return (
    <div className="societycontainer">
      <div className="societysignup">
        <h2>Society Signup</h2>

        {/* ── Step 1: Email Verify ── */}
        {step === 1 && (
          <form onSubmit={handleVerifyEmail}>
            <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 12 }}>
              Enter your society's registered email to verify
            </p>
            <input
              type="email"
              placeholder="Society Email"
              value={emailInput}
              onChange={(e) => { setEmailInput(e.target.value); setVerifyError(""); }}
              required
            />
            {verifyError && (
              <p style={{ color: "#dc2626", fontSize: 12, margin: "4px 0 0" }}>
                {verifyError}
              </p>
            )}
            <button className="btn" type="submit" disabled={verifyLoading}>
              {verifyLoading ? "Verifying..." : "Verify Email"}
            </button>
            <p style={{ fontSize: 12, color: "#9ca3af", textAlign: "center", marginTop: 8 }}>
              Already have an account?{" "}
              <span style={{ color: "#b5651d", cursor: "pointer" }} onClick={() => navigate("/login")}>
                Login
              </span>
            </p>
          </form>
        )}

        {/* ── Step 2: Full Form ── */}
        {step === 2 && (
          <form onSubmit={handleSubmit}>
            <p style={{ fontSize: 13, color: "#16a34a", marginBottom: 12 }}>
              ✓ Email verified: <strong>{formData.email}</strong>
            </p>

            <input
              type="text"
              name="societyName"
              placeholder="Society Name"
              value={formData.societyName}
              onChange={handleChange}
              required
            />

            <select
              name="societyType"
              value={formData.societyType}
              onChange={handleChange}
              required
            >
              <option value="">Select Society Type</option>
              <option value="Academic & Literary">Academic & Literary</option>
              <option value="Cultural & Arts">Cultural & Arts</option>
              <option value="Social & Service">Social & Service</option>
              <option value="Specialized Cells">Specialized Cells</option>
              <option value="Technical & Hobby">Technical & Hobby</option>
            </select>

            <input
              type="text"
              name="collegeName"
              placeholder="College Name"
              value={formData.collegeName}
              onChange={handleChange}
              required
            />

            <input
              type="text"
              name="coordinatorName"
              placeholder="Coordinator Name"
              value={formData.coordinatorName}
              onChange={handleChange}
            />

            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
            />

            <input
              type="password"
              name="repassword"
              placeholder="Re-enter Password"
              value={formData.repassword}
              onChange={handleChange}
              required
            />

            <button className="btn" type="submit">Signup</button>

            <button
              type="button"
              className="btn"
              style={{ background: "none", color: "#6b7280", border: "1px solid #e5e7eb", marginTop: 6 }}
              onClick={() => setStep(1)}
            >
              ← Change Email
            </button>
          </form>
        )}
      </div>
    </div>
  );
}