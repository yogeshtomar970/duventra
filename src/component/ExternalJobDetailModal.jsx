import React, { useState } from "react";
import { FaArrowLeft } from "react-icons/fa6";
import { FaMapMarkerAlt, FaRegClock, FaBuilding } from "react-icons/fa";

// Card par click hone par JSearch se aaya poora job data yahan dikhta hai —
// same visual language jitna ho sake JobDetailModal ke, taaki dono job
// types (college vs external) ka look-and-feel match kare.
export default function ExternalJobDetailModal({ job, onClose }) {
  const [expanded, setExpanded] = useState(false);
  const desc = job.description || "";
  const isLong = desc.length > 300;

  const salaryText =
    job.minSalary && job.maxSalary
      ? `${job.salaryCurrency || ""} ${job.minSalary.toLocaleString()} - ${job.maxSalary.toLocaleString()}`
      : null;

  return (
    <div className="pc-overlay" onClick={onClose}>
      <div className="pc-modal pc-detail-modal" onClick={(e) => e.stopPropagation()}>
        <div className="pc-modal-header">
          <button className="pc-back-btn" onClick={onClose}>
            <FaArrowLeft />
          </button>
          <h2 className="pc-modal-title">Job Details</h2>
          <div style={{ width: 32 }} />
        </div>

        <div className="pc-modal-body">
          {/* Hero */}
          <div className="pc-detail-hero">
            {job.companyLogo ? (
              <img src={job.companyLogo} alt={job.company} className="pc-avatar" />
            ) : (
              <div className="pc-avatar pc-avatar-fallback" style={{ background: "#4f46e5" }}>
                <FaBuilding />
              </div>
            )}
            <div>
              <h2 className="pc-detail-job-title">{job.title}</h2>
              <span className="pc-job-society" style={{ color: "#4f46e5" }}>
                {job.company}
              </span>
              <div className="pc-job-meta" style={{ marginTop: 6 }}>
                <span>
                  <FaMapMarkerAlt /> {job.isRemote ? "Remote" : job.location}
                </span>
                <span>
                  <FaRegClock /> {job.employmentType}
                </span>
              </div>
              {job.publisher && (
                <p className="pc-job-date">Source: {job.publisher}</p>
              )}
            </div>
          </div>

          {salaryText && (
            <div className="pc-section">
              <h4 className="pc-section-title">Salary</h4>
              <p className="pc-desc-text">{salaryText}</p>
            </div>
          )}

          {/* Description */}
          <div className="pc-section">
            <h4 className="pc-section-title">Job Description</h4>
            <p className="pc-desc-text">
              {isLong && !expanded ? desc.slice(0, 300) + "..." : desc}
            </p>
            {isLong && (
              <button className="pc-read-more" onClick={() => setExpanded(!expanded)}>
                {expanded ? "Show less" : "Read more"}
              </button>
            )}
          </div>
        </div>

        <div className="pc-modal-footer">
          <button
            className="pc-apply-btn"
            onClick={() => window.open(job.applyLink, "_blank", "noopener,noreferrer")}
            disabled={!job.applyLink}
          >
            Apply Now ↗
          </button>
        </div>
      </div>
    </div>
  );
}