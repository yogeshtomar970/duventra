import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaBriefcase, FaMapMarkerAlt, FaRupeeSign, FaClock,
  FaBookmark, FaEyeSlash, FaSearch, FaFilter
} from "react-icons/fa";
import API_BASE_URL from "../config/api.js";
import BottomNav from "../component/BottomNav";
import Navbar from "../component/Navbar";
import Sidebar from "../component/sidebar";
import "../styles/JobPage.css";

const JOB_TYPES = ["All", "Full-time", "Part-time", "Internship", "Freelance", "Contract"];

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const d = Math.floor(diff / 86400000);
  if (d === 0) return "Today";
  if (d === 1) return "1 Day Ago";
  if (d < 30) return `${d} Days Ago`;
  return new Date(dateStr).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

function SocAvatar({ name = "", pic = "" }) {
  const colors = ["#4f46e5", "#0891b2", "#059669", "#d97706", "#7c3aed", "#dc2626"];
  const bg = colors[(name.charCodeAt(0) || 0) % colors.length];
  if (pic) return <img src={pic} alt={name} className="jp-company-logo" />;
  return (
    <div className="jp-company-logo jp-logo-fallback" style={{ background: bg }}>
      {(name[0] || "S").toUpperCase()}
    </div>
  );
}

function JobCard({ job, onApply, onHide, onSave, savedIds, hiddenIds, appliedIds }) {
  const [expanded, setExpanded] = useState(false);
  if (hiddenIds.includes(job._id)) return null;
  const isSaved = savedIds.includes(job._id);
  const isApplied = appliedIds.includes(job._id);
  const desc = job.description || "";

  return (
    <div className="jp-job-card">
      <div className="jp-card-top">
        <div className="jp-card-left">
          <h3 className="jp-job-title">{job.title}</h3>
          <p className="jp-company-name">{job.societyName}</p>

          <div className="jp-meta-row">
            <span className="jp-meta-item">
              <FaBriefcase /> {job.jobType}
            </span>
            <span className="jp-meta-item">
              <FaRupeeSign /> {job.Salary || "25,000"}
            </span>
            <span className="jp-meta-item">
              <FaMapMarkerAlt /> {job.location || "Delhi, India"}
            </span>
          </div>

          <p className="jp-desc">
            {expanded || desc.length <= 100 ? desc : desc.slice(0, 100) + "..."}
            {desc.length > 100 && (
              <button className="jp-read-more" onClick={() => setExpanded(!expanded)}>
                {expanded ? " less" : " more"}
              </button>
            )}
          </p>

          {job.customFields?.length > 0 && (
            <div className="jp-tags">
              {job.customFields.map((f, i) => (
                <span key={i} className="jp-tag">{f.fieldTitle}</span>
              ))}
            </div>
          )}

          <p className="jp-posted-date">{timeAgo(job.createdAt)}</p>
        </div>

        <SocAvatar name={job.societyName} pic={job.societyPic} />
      </div>

      <div className="jp-card-actions">
        <button className="jp-action-btn" onClick={() => onHide(job._id)}>
          <FaEyeSlash /> Hide
        </button>
        <button
          className={`jp-action-btn ${isSaved ? "jp-saved" : ""}`}
          onClick={() => onSave(job._id)}
        >
          <FaBookmark /> {isSaved ? "Saved" : "Save"}
        </button>
        <button
          className={`jp-apply-btn ${isApplied ? "jp-applied" : ""}`}
          onClick={() => !isApplied && onApply(job)}
          disabled={isApplied}
        >
          {isApplied ? "Applied ✓" : "Apply Now"}
        </button>
      </div>
    </div>
  );
}

// Apply Modal
function ApplyModal({ job, onClose, onSubmit, loading }) {
  const [form, setForm] = useState({});

  const handleSubmit = () => {
    for (const f of (job.customFields || [])) {
      if (!form[f.fieldTitle]?.trim()) {
        alert(`Please fill: ${f.fieldTitle}`);
        return;
      }
    }
    onSubmit(form);
  };

  return (
    <div className="jp-overlay" onClick={onClose}>
      <div className="jp-modal" onClick={e => e.stopPropagation()}>
        <div className="jp-modal-header">
          <h3>Apply — {job.title}</h3>
          <button className="jp-modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="jp-modal-body">
          {!job.customFields?.length ? (
            <p className="jp-modal-empty">No extra info needed. Click Submit!</p>
          ) : (
            job.customFields.map((f, i) => (
              <div key={i} className="jp-form-group">
                <label className="jp-label">{f.fieldTitle} *</label>
                {f.fieldDescription && <p className="jp-hint">{f.fieldDescription}</p>}
                <input
                  className="jp-input"
                  placeholder={f.fieldDescription || f.fieldTitle}
                  value={form[f.fieldTitle] || ""}
                  onChange={e => setForm(p => ({ ...p, [f.fieldTitle]: e.target.value }))}
                />
              </div>
            ))
          )}
        </div>
        <div className="jp-modal-footer">
          <button className="jp-submit-btn" onClick={handleSubmit} disabled={loading}>
            {loading ? "Submitting..." : "Submit Application"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function JobPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [savedIds, setSavedIds] = useState([]);
  const [hiddenIds, setHiddenIds] = useState([]);
  const [appliedIds, setAppliedIds] = useState([]);
  const [applyJob, setApplyJob] = useState(null);
  const [applyLoading, setApplyLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("all"); // "all" | "saved"

  const user = JSON.parse(localStorage.getItem("user")) || {};

  useEffect(() => {
    if (sidebarOpen) document.body.classList.add("no-scroll");
    else document.body.classList.remove("no-scroll");
  }, [sidebarOpen]);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/placement/jobs`)
      .then(r => r.json())
      .then(d => { if (d.success) setJobs(d.data); })
      .catch(() => {})
      .finally(() => setLoading(false));

    if (user?.id) {
      fetch(`${API_BASE_URL}/api/placement/applied/${user.id}`)
        .then(r => r.json())
        .then(d => { if (d.success) setAppliedIds(d.data.map(a => a.jobId)); })
        .catch(() => {});
    }
  }, []);

  const handleHide = (id) => setHiddenIds(prev => [...prev, id]);
  const handleSave = (id) => setSavedIds(prev =>
    prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
  );

  const handleApply = async (form) => {
    setApplyLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/placement/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobId: applyJob._id,
          userId: user.id,
          userName: user.name,
          userEmail: user.email,
          responses: form,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setAppliedIds(prev => [...prev, applyJob._id]);
        setApplyJob(null);
        alert("Application submitted! ✅");
      }
    } catch (e) { alert("Error applying"); }
    finally { setApplyLoading(false); }
  };

  const filtered = jobs.filter(j => {
    const matchType = filter === "All" || j.jobType === filter;
    const matchSearch = !search || j.title.toLowerCase().includes(search.toLowerCase()) ||
      j.societyName?.toLowerCase().includes(search.toLowerCase());
    const matchSaved = activeSection === "saved" ? savedIds.includes(j._id) : true;
    return matchType && matchSearch && matchSaved;
  });

  const visibleCount = filtered.filter(j => !hiddenIds.includes(j._id)).length;

  return (
    <>
      <Navbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <BottomNav />

      <div className="jp-page">
        {/* Search bar */}
        <div className="jp-search-wrap">
          <div className="jp-search-box">
            <FaSearch className="jp-search-icon" />
            <input
              className="jp-search-input"
              placeholder="Search jobs, societies..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="jp-layout">
          {/* Left — Job List */}
          <div className="jp-left">
            {/* Section tabs */}
            <div className="jp-section-tabs">
              <button
                className={`jp-section-tab ${activeSection === "all" ? "active" : ""}`}
                onClick={() => setActiveSection("all")}
              >
                All Jobs ({jobs.filter(j => !hiddenIds.includes(j._id)).length})
              </button>
              <button
                className={`jp-section-tab ${activeSection === "saved" ? "active" : ""}`}
                onClick={() => setActiveSection("saved")}
              >
                Saved ({savedIds.length})
              </button>
            </div>

            {/* Filter chips */}
            <div className="jp-filter-row">
              {JOB_TYPES.map(f => (
                <button
                  key={f}
                  className={`jp-filter-chip ${filter === f ? "active" : ""}`}
                  onClick={() => setFilter(f)}
                >
                  {f}
                </button>
              ))}
            </div>

            {/* Jobs */}
            {loading ? (
              <div className="jp-state">
                <div className="jp-loader"><div /><div /><div /></div>
              </div>
            ) : visibleCount === 0 ? (
              <div className="jp-state">
                <FaBriefcase style={{ fontSize: 36, color: "#ccc" }} />
                <p style={{ color: "#888" }}>
                  {activeSection === "saved" ? "No saved jobs" : "No jobs found"}
                </p>
              </div>
            ) : (
              filtered.map(job => (
                <JobCard
                  key={job._id}
                  job={job}
                  onApply={setApplyJob}
                  onHide={handleHide}
                  onSave={handleSave}
                  savedIds={savedIds}
                  hiddenIds={hiddenIds}
                  appliedIds={appliedIds}
                />
              ))
            )}
          </div>

          {/* Right — Preferences sidebar */}
          <div className="jp-right">
            <div className="jp-pref-card">
              <h3 className="jp-pref-title">Filter by Type</h3>
              <div className="jp-pref-tags">
                {JOB_TYPES.filter(t => t !== "All").map(t => (
                  <span
                    key={t}
                    className={`jp-pref-tag ${filter === t ? "active" : ""}`}
                    onClick={() => setFilter(prev => prev === t ? "All" : t)}
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>

            <div className="jp-pref-card" style={{ marginTop: 14 }}>
              <h3 className="jp-pref-title">Quick Stats</h3>
              <p className="jp-stat">Total Jobs: <strong>{jobs.length}</strong></p>
              <p className="jp-stat">Applied: <strong>{appliedIds.length}</strong></p>
              <p className="jp-stat">Saved: <strong>{savedIds.length}</strong></p>
            </div>
          </div>
        </div>
      </div>

      {applyJob && (
        <ApplyModal
          job={applyJob}
          onClose={() => setApplyJob(null)}
          onSubmit={handleApply}
          loading={applyLoading}
        />
      )}
    </>
  );
}
