import React, { useEffect, useState } from "react";
import { FaBriefcase, FaMapMarkerPin, FaClock, FaPlus, FaTrash, FaArrowLeft, FaXmark, FaEllipsisVertical } from "react-icons/fa6";
import { FaMapMarkerAlt, FaRegClock } from "react-icons/fa";
import API_BASE_URL from "../config/api.js";
import BottomNav from "../component/BottomNav";
import Navbar from "../component/Navbar";
import Sidebar from "../component/sidebar";
import "../styles/PlacementCell.css";

// ─── Helpers ───────────────────────────────────────────
const JOB_TYPES = ["Full-time", "Part-time", "Internship", "Freelance", "Contract"];

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const d = Math.floor(diff / 86400000);
  if (d === 0) return "Today";
  if (d === 1) return "Yesterday";
  if (d < 30) return `${d} days ago`;
  return new Date(dateStr).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

const TYPE_COLORS = {
  "Full-time": "#4f46e5",
  "Part-time": "#0891b2",
  "Internship": "#059669",
  "Freelance": "#d97706",
  "Contract": "#dc2626",
};

// ─── Avatar ────────────────────────────────────────────
function SocAvatar({ name = "", pic = "" }) {
  if (pic) return <img src={pic} alt={name} className="pc-avatar" />;
  const initials = name.split(" ").slice(0, 2).map(w => w[0]?.toUpperCase() || "").join("");
  const colors = ["#4f46e5","#0891b2","#059669","#d97706","#7c3aed"];
  const bg = colors[name.charCodeAt(0) % colors.length];
  return <div className="pc-avatar pc-avatar-fallback" style={{ background: bg }}>{initials}</div>;
}

// ─── Job Card ──────────────────────────────────────────
function JobCard({ job, isAdmin, onView, onDelete }) {
  const typeColor = TYPE_COLORS[job.jobType] || "#4f46e5";
  return (
    <div className="pc-job-card" onClick={() => onView(job)}>
      <div className="pc-job-card-header">
        <SocAvatar name={job.societyName} pic={job.societyPic} />
        <div className="pc-job-card-info">
          <h3 className="pc-job-title">{job.title}</h3>
          <span className="pc-job-society" style={{ color: typeColor }}>{job.societyName}</span>
          <div className="pc-job-meta">
            <span><FaMapMarkerAlt /> {job.location || "Delhi, India"}</span>
            <span><FaRegClock /> {job.jobType}</span>
          </div>
          <p className="pc-job-date">Posted on {timeAgo(job.createdAt)}</p>
        </div>
        {isAdmin && (
          <button className="pc-dot-menu" onClick={(e) => { e.stopPropagation(); onDelete(job._id); }}>
            <FaTrash />
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Job Detail Modal ──────────────────────────────────
function JobDetailModal({ job, onClose, onApply, alreadyApplied }) {
  const [expanded, setExpanded] = useState(false);
  const desc = job.description || "";
  const isLong = desc.length > 200;
  const typeColor = TYPE_COLORS[job.jobType] || "#4f46e5";

  return (
    <div className="pc-overlay" onClick={onClose}>
      <div className="pc-modal pc-detail-modal" onClick={e => e.stopPropagation()}>
        <div className="pc-modal-header">
          <button className="pc-back-btn" onClick={onClose}><FaArrowLeft /></button>
          <h2 className="pc-modal-title">Job Details</h2>
          <div style={{ width: 32 }} />
        </div>
        <div className="pc-modal-body">
          {/* Hero */}
          <div className="pc-detail-hero">
            <SocAvatar name={job.societyName} pic={job.societyPic} />
            <div>
              <h2 className="pc-detail-job-title">{job.title}</h2>
              <span className="pc-job-society" style={{ color: typeColor }}>{job.societyName}</span>
              <div className="pc-job-meta" style={{ marginTop: 6 }}>
                <span><FaMapMarkerAlt /> {job.location || "Delhi, India"}</span>
                <span><FaRegClock /> {job.jobType}</span>
              </div>
              <p className="pc-job-date">Posted on {timeAgo(job.createdAt)}</p>
            </div>
          </div>

          {/* Description */}
          <div className="pc-section">
            <h4 className="pc-section-title">Job Description</h4>
            <p className="pc-desc-text">
              {isLong && !expanded ? desc.slice(0, 200) + "..." : desc}
            </p>
            {isLong && (
              <button className="pc-read-more" onClick={() => setExpanded(!expanded)}>
                {expanded ? "Show less" : "Read more"}
              </button>
            )}
          </div>

          {/* Custom Fields */}
          {job.customFields?.length > 0 && (
            <div className="pc-section">
              <h4 className="pc-section-title">Custom Fields</h4>
              <div className="pc-custom-fields-list">
                {job.customFields.map((f, i) => (
                  <div className="pc-custom-field-chip" key={i}>
                    <p className="pc-cf-title">{f.fieldTitle}</p>
                    {f.fieldDescription && <p className="pc-cf-desc">{f.fieldDescription}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="pc-modal-footer">
          <button
            className="pc-apply-btn"
            onClick={onApply}
            disabled={alreadyApplied}
            style={alreadyApplied ? { background: "#e0e0e0", color: "#888" } : {}}
          >
            {alreadyApplied ? "Already Applied ✓" : "Apply Now"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Apply Modal ────────────────────────────────────────
function ApplyModal({ job, onClose, onSubmit, loading }) {
  const [form, setForm] = useState({});

  const handleChange = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const handleSubmit = () => {
    // Check required custom fields
    for (const f of (job.customFields || [])) {
      if (!form[f.fieldTitle]?.trim()) {
        alert(`Please fill: ${f.fieldTitle}`);
        return;
      }
    }
    onSubmit(form);
  };

  return (
    <div className="pc-overlay" onClick={onClose}>
      <div className="pc-modal pc-apply-modal" onClick={e => e.stopPropagation()}>
        <div className="pc-modal-header">
          <button className="pc-back-btn" onClick={onClose}><FaArrowLeft /></button>
          <h2 className="pc-modal-title">Apply for {job.title}</h2>
          <div style={{ width: 32 }} />
        </div>
        <div className="pc-modal-body">
          {job.customFields?.length === 0 || !job.customFields ? (
            <p style={{ color: "#888", textAlign: "center", padding: "2rem 0" }}>
              No extra info needed. Just click Submit!
            </p>
          ) : (
            job.customFields.map((f, i) => (
              <div className="pc-form-group" key={i}>
                <label className="pc-label">{f.fieldTitle} *</label>
                {f.fieldDescription && <p className="pc-field-hint">{f.fieldDescription}</p>}
                <input
                  className="pc-input"
                  placeholder={f.fieldDescription || f.fieldTitle}
                  value={form[f.fieldTitle] || ""}
                  onChange={e => handleChange(f.fieldTitle, e.target.value)}
                />
              </div>
            ))
          )}
        </div>
        <div className="pc-modal-footer">
          <button className="pc-apply-btn" onClick={handleSubmit} disabled={loading}>
            {loading ? "Submitting..." : "Submit Application"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Create Job Modal ───────────────────────────────────
function CreateJobModal({ onClose, onSave, societyName, societyPic, societyId }) {
  const [step, setStep] = useState(1); // 1=basic info, 2=custom fields
  const [form, setForm] = useState({ title: "", jobType: "", location: "", description: "", societyId, societyName, societyPic });
  const [customFields, setCustomFields] = useState([]);
  const [saving, setSaving] = useState(false);

  const addField = () => setCustomFields(prev => [...prev, { fieldTitle: "", fieldDescription: "" }]);
  const removeField = (i) => setCustomFields(prev => prev.filter((_, idx) => idx !== i));
  const updateField = (i, key, val) => setCustomFields(prev => prev.map((f, idx) => idx === i ? { ...f, [key]: val } : f));

  const handleNext = () => {
    if (!form.title.trim()) return alert("Job Title zaroori hai");
    if (!form.jobType) return alert("Job Type select karo");
    if (!form.description.trim()) return alert("Job Description zaroori hai");
    setStep(2);
  };

  const handleSave = async () => {
    setSaving(true);
    await onSave({ ...form, customFields });
    setSaving(false);
  };

  return (
    <div className="pc-overlay" onClick={onClose}>
      <div className="pc-modal pc-create-modal" onClick={e => e.stopPropagation()}>
        <div className="pc-modal-header">
          <button className="pc-back-btn" onClick={step === 1 ? onClose : () => setStep(1)}>
            <FaArrowLeft />
          </button>
          <h2 className="pc-modal-title">{step === 1 ? "Create New Job" : "Custom Fields"}</h2>
          <div style={{ width: 32 }} />
        </div>

        {step === 1 && (
          <>
            <div className="pc-modal-body">
              <p className="pc-section-title">Basic Information</p>

              <div className="pc-form-group">
                <label className="pc-label">Job Title *</label>
                <input className="pc-input" placeholder="e.g. Frontend Developer"
                  value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
              </div>

              <div className="pc-form-group">
                <label className="pc-label">Job Type *</label>
                <select className="pc-input pc-select" value={form.jobType}
                  onChange={e => setForm(p => ({ ...p, jobType: e.target.value }))}>
                  <option value="">Select Job Type</option>
                  {JOB_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              <div className="pc-form-group">
                <label className="pc-label">Location</label>
                <input className="pc-input" placeholder="e.g. Delhi, India"
                  value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))} />
              </div>

              <div className="pc-form-group">
                <label className="pc-label">Job Description *</label>
                <textarea className="pc-input pc-textarea" placeholder="Write job description..."
                  value={form.description} maxLength={500}
                  onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
                <p className="pc-char-count">{form.description.length}/500</p>
              </div>

              {/* Action cards */}
              <div className="pc-action-cards">
                <div className="pc-action-card" onClick={() => { handleNext(); }}>
                  <FaPlus className="pc-action-icon" />
                  <p className="pc-action-label">Add Custom Fields</p>
                  <p className="pc-action-sub">Add extra fields for this job</p>
                </div>
                <div className="pc-action-card" onClick={handleNext}>
                  <span className="pc-action-icon">👁</span>
                  <p className="pc-action-label">Preview Job Card</p>
                  <p className="pc-action-sub">See how it will appear</p>
                </div>
              </div>
            </div>
            <div className="pc-modal-footer">
              <button className="pc-apply-btn" onClick={handleNext}>Next</button>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div className="pc-modal-body">
              <div className="pc-info-banner">
                ℹ️ Add custom fields that applicants need to fill for this job.
              </div>

              {customFields.map((f, i) => (
                <div className="pc-custom-field-builder" key={i}>
                  <div className="pc-cf-row">
                    <div className="pc-cf-drag">⠿</div>
                    <div className="pc-cf-inputs">
                      <input className="pc-input" placeholder="Field Title"
                        value={f.fieldTitle} onChange={e => updateField(i, "fieldTitle", e.target.value)} />
                      <input className="pc-input" placeholder="Field Description (Optional)"
                        value={f.fieldDescription} onChange={e => updateField(i, "fieldDescription", e.target.value)} />
                    </div>
                    <button className="pc-remove-field" onClick={() => removeField(i)}><FaTrash /></button>
                  </div>
                </div>
              ))}

              <button className="pc-add-field-btn" onClick={addField}>
                <FaPlus /> Add New Field
              </button>
            </div>
            <div className="pc-modal-footer">
              <button className="pc-apply-btn" onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : "Save Fields"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Filter Bar ─────────────────────────────────────────
function FilterBar({ filter, setFilter }) {
  const filters = ["All", ...JOB_TYPES];
  return (
    <div className="pc-filter-bar">
      {filters.map(f => (
        <button key={f} className={`pc-filter-btn ${filter === f ? "active" : ""}`}
          onClick={() => setFilter(f)}>{f}</button>
      ))}
    </div>
  );
}

// ─── Main PlacementCell Page ────────────────────────────
export default function PlacementCell() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Modals
  const [viewJob, setViewJob] = useState(null);
  const [applyJob, setApplyJob] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [applyLoading, setApplyLoading] = useState(false);
  const [appliedIds, setAppliedIds] = useState([]);

  const user = JSON.parse(localStorage.getItem("user")) || {};
  const isAdmin = user?.role === "society"; // society account = admin

  useEffect(() => {
    if (sidebarOpen) document.body.classList.add("no-scroll");
    else document.body.classList.remove("no-scroll");
  }, [sidebarOpen]);

  // Fetch jobs
  const fetchJobs = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/placement/jobs`);
      const data = await res.json();
      if (data.success) setJobs(data.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  // Fetch my applied jobs
  const fetchApplied = async () => {
    if (!user?.id) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/placement/applied/${user.id}`);
      const data = await res.json();
      if (data.success) setAppliedIds(data.data.map(a => a.jobId));
    } catch (e) {}
  };

  useEffect(() => {
    fetchJobs();
    fetchApplied();
  }, []);

  // Create job
  const handleCreateJob = async (jobData) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/placement/jobs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(jobData),
      });
      const data = await res.json();
      if (data.success) {
        setJobs(prev => [data.data, ...prev]);
        setShowCreate(false);
      }
    } catch (e) { alert("Error creating job"); }
  };

  // Delete job
  const handleDelete = async (jobId) => {
  if (!window.confirm("Want to Delete this job?")) return;
  try {
    const res = await fetch(`${API_BASE_URL}/api/placement/jobs/${jobId}/${user.societyId}`, {
      method: "DELETE",
    });
    const data = await res.json();
    if (data.success) setJobs(prev => prev.filter(j => j._id !== jobId));
    else alert(data.message);
  } catch (e) { alert("Error deleting job"); }
};

  // Apply
  const handleApply = async (formData) => {
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
          responses: formData,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setAppliedIds(prev => [...prev, applyJob._id]);
        setApplyJob(null);
        setViewJob(null);
        alert("Application submitted! ✅");
      }
    } catch (e) { alert("Error applying"); }
    finally { setApplyLoading(false); }
  };

  const filtered = filter === "All" ? jobs : jobs.filter(j => j.jobType === filter);

  return (
    <>
      <Navbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <BottomNav />

      <div className="pc-page">
        {/* Top bar */}
        <div className="pc-top-bar">
          <FaBriefcase className="pc-top-icon" />
          <span className="pc-top-title">Placement Cell</span>
        </div>

        {/* Filter */}
        <FilterBar filter={filter} setFilter={setFilter} />

        {/* New Job button — only admin */}
        {isAdmin && (
          <div className="pc-new-job-wrap">
            <button className="pc-new-job-btn" onClick={() => setShowCreate(true)}>
              <FaPlus /> New Job
            </button>
          </div>
        )}

        {/* Job list */}
        <div className="pc-job-list">
          {loading ? (
            <div className="pc-state-center">
              <div className="pc-loader">
                <div /><div /><div />
              </div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="pc-state-center">
              <FaBriefcase style={{ fontSize: 40, color: "#ccc" }} />
              <p style={{ color: "#888" }}>No jobs available right now</p>
            </div>
          ) : (
            filtered.map(job => (
              <JobCard
                key={job._id}
                job={job}
                isAdmin={isAdmin}
                onView={setViewJob}
                onDelete={handleDelete}
              />
            ))
          )}
        </div>
      </div>

      {/* Job Detail Modal */}
      {viewJob && !applyJob && (
        <JobDetailModal
          job={viewJob}
          onClose={() => setViewJob(null)}
          alreadyApplied={appliedIds.includes(viewJob._id)}
          onApply={() => {
            if (isAdmin) return alert("Admin apply nahi kar sakta");
            setApplyJob(viewJob);
          }}
        />
      )}

      {/* Apply Modal */}
      {applyJob && (
        <ApplyModal
          job={applyJob}
          onClose={() => setApplyJob(null)}
          onSubmit={handleApply}
          loading={applyLoading}
        />
      )}

      {/* Create Job Modal */}
      {showCreate && (
        <CreateJobModal
          onClose={() => setShowCreate(false)}
          onSave={handleCreateJob}
          societyName={user.societyName || user.name}
          societyPic={user.profilePic || ""}
          societyId={user.societyId}
        />
      )}
    </>
  );
}
