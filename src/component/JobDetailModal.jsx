import React, { useState } from "react";
import { FaArrowLeft } from "react-icons/fa6";
import { FaMapMarkerAlt, FaRegClock } from "react-icons/fa";

// ── Shared job-card helpers — PlacementCell aur Profile (PostNewsTab) dono
// isi se import karte hain, taaki design/behaviour hamesha same rahe ──
export function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const d = Math.floor(diff / 86400000);
  if (d === 0) return "Today";
  if (d === 1) return "Yesterday";
  if (d < 30) return `${d} days ago`;
  return new Date(dateStr).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export const TYPE_COLORS = {
  "Full-time": "#4f46e5",
  "Part-time": "#0891b2",
  "Internship": "#059669",
  "Freelance": "#d97706",
  "Contract": "#dc2626",
};

export function SocAvatar({ name = "", pic = "" }) {
  if (pic) return <img src={pic} alt={name} className="pc-avatar" />;
  const initials = name.split(" ").slice(0, 2).map(w => w[0]?.toUpperCase() || "").join("");
  const colors = ["#4f46e5", "#0891b2", "#059669", "#d97706", "#7c3aed"];
  const bg = colors[name.charCodeAt(0) % colors.length];
  return <div className="pc-avatar pc-avatar-fallback" style={{ background: bg }}>{initials}</div>;
}

// ── Job Detail Modal ──────────────────────────────────
// hideFooter=true: read-only view (Profile me apni khud ki job dekhne ke
// liye) — Apply Now button dikhta hi nahi
export default function JobDetailModal({ job, onClose, onApply, onConfirmApplied, alreadyApplied, hideFooter }) {
  const [expanded, setExpanded] = useState(false);
  const [formOpened, setFormOpened] = useState(false);
  const desc = job.description || "";
  const isLong = desc.length > 200;
  const typeColor = TYPE_COLORS[job.jobType] || "#4f46e5";

  const hasFormLink = !!job.formLink;

  const handleClick = () => {
    if (hasFormLink && !formOpened) {
      // Step 1: sirf form kholo — apply mark mat karo, modal bhi khula rahega
      onApply();
      setFormOpened(true);
    } else if (hasFormLink && formOpened) {
      // Step 2: user ne form fill/submit kar liya, ab explicitly confirm kiya
      onConfirmApplied();
    } else {
      // Purana flow — custom-fields modal
      onApply();
    }
  };

  const label = alreadyApplied
    ? "Already Applied ✓"
    : hasFormLink && formOpened
    ? "Mark as Applied ✓"
    : hasFormLink
    ? "Apply Now ↗"
    : "Apply Now";

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
        {!hideFooter && (
          <div className="pc-modal-footer">
            {hasFormLink && formOpened && !alreadyApplied && (
              <p style={{ fontSize: 13, color: "#888", textAlign: "center", margin: "0 0 8px" }}>
                Form fill karke submit kar diya? Neeche confirm karo.
              </p>
            )}
            <button
              className="pc-apply-btn"
              onClick={handleClick}
              disabled={alreadyApplied}
              style={alreadyApplied ? { background: "#e0e0e0", color: "#888" } : {}}
            >
              {label}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}