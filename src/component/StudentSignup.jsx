import API_BASE_URL from "../config/api.js";
import { useState } from "react";
import "../studentsignup.css";
import { useNavigate } from "react-router-dom";

export default function StudentSignup() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: verify, 2: complete signup

  // Step 1 fields
  const [verifyData, setVerifyData] = useState({
    name: "",
    rollNo: "",
    course: "",
    collegeName: "",
  });

  // Step 2 fields
  const [email, setEmail] = useState("");
  const [year, setYear] = useState("");
  const [password, setPassword] = useState("");
  const [repassword, setRepassword] = useState("");
  const [idCard, setIdCard] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  const handleVerifyChange = (e) => {
    setVerifyData({ ...verifyData, [e.target.name]: e.target.value });
  };

  // ── Step 1: validstudents collection se match check ──
  const handleVerify = async (e) => {
    e.preventDefault();
    setError("");
    const { name, rollNo, course, collegeName } = verifyData;
    if (!name || !rollNo || !course || !collegeName)
      return setError("Sab fields fill karein");

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/student/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(verifyData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Verification failed");

      setInfo("✅ Details verified! Aage badhein.");
      setStep(2);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2: Actual signup ──────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== repassword)
      return setError("Passwords do not match.");
    if (!idCard)
      return setError("Upload Id card");

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("name",        verifyData.name);
      formData.append("rollNo",      verifyData.rollNo);
      formData.append("course",      verifyData.course);
      formData.append("collegeName", verifyData.collegeName);
      formData.append("email",       email);
      formData.append("year",        year);
      formData.append("password",    password);
      formData.append("repassword",  repassword);
      formData.append("idCard",      idCard);

      const res = await fetch(`${API_BASE_URL}/api/student/signup`, {
        method: "POST",
        body: formData,
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Signup failed");

      setInfo("Sign-up successful! Redirecting to the login page...");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="societycontainer">
      <div className="studentsignup">
        <h2>Student Signup</h2>

        {/* ── Step indicator ── */}
        <div className="ss-steps">
          <span className={`ss-step ${step >= 1 ? "active" : ""}`}>1</span>
          <span className="ss-step-line" />
          <span className={`ss-step ${step >= 2 ? "active" : ""}`}>2</span>
        </div>
        <p className="ss-step-label">
          {step === 1 ? "Verify your details" : "Set up account"}
        </p>

        {error && <p className="ss-error">{error}</p>}
        {info  && <p className="ss-info">{info}</p>}

        {/* ── Step 1: Verify ── */}
        {step === 1 && (
          <form onSubmit={handleVerify}>
            <input
              name="name"
              placeholder="Name (as per ID card)"
              value={verifyData.name}
              onChange={handleVerifyChange}
            />
            <input
              name="rollNo"
              placeholder="Roll No (as per ID card)"
              value={verifyData.rollNo}
              onChange={handleVerifyChange}
            />
            <input
              name="course"
              placeholder="Course (as per ID card)"
              value={verifyData.course}
              onChange={handleVerifyChange}
            />
            <input
              name="collegeName"
              placeholder="College Name (as per ID card)"
              value={verifyData.collegeName}
              onChange={handleVerifyChange}
            />
            <p className="ss-hint">
              ⚠️Exactly fill what is on the card.
            </p>
            <button className="btn" type="submit" disabled={loading}>
              {loading ? "Verifying..." : "Verify & Continue"}
            </button>
          </form>
        )}

        {/* ── Step 2: Complete signup ── */}
        {step === 2 && (
          <form onSubmit={handleSubmit}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              name="year"
              placeholder="Year (e.g. 2nd Year)"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Re-enter Password"
              value={repassword}
              onChange={(e) => setRepassword(e.target.value)}
              required
            />
            <label className="ss-file-label">Upload ID Card</label>
            <input
              type="file"
              accept="image/*,application/pdf"
              onChange={(e) => setIdCard(e.target.files[0])}
              required
            />
            <button className="btn" type="submit" disabled={loading}>
              {loading ? "Creating account..." : "Create Account"}
            </button>
            <button
              type="button"
              className="ss-back-btn"
              onClick={() => { setStep(1); setError(""); setInfo(""); }}
            >
              ← Back
            </button>
          </form>
        )}
      </div>
    </div>
  );
}