import React, { useState } from "react";
import { FaTimes } from "react-icons/fa";
import API_BASE_URL from "../config/api.js";
import "../styles/EditNewsModal.css";
import { toast } from "react-toastify";

const JOB_TYPES = ["Full-time", "Part-time", "Internship", "Freelance", "Contract"];

/**
 * EditJobModal
 * Edit title / type / location / description / form-link for a placement job.
 */
export default function EditJobModal({ job, onUpdated, onClose }) {
  const [title, setTitle] = useState(job.title || "");
  const [jobType, setJobType] = useState(job.jobType || "");
  const [location, setLocation] = useState(job.location || "");
  const [description, setDescription] = useState(job.description || "");
  const [formLink, setFormLink] = useState(job.formLink || "");
  const [saving, setSaving] = useState(false);

  const handleUpdate = async () => {
    if (!title.trim()) return toast.info("Job Title zaroori hai");
    if (!jobType) return toast.info("Job Type select karo");
    if (!description.trim()) return toast.info("Job Description zaroori hai");

    setSaving(true);
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_BASE_URL}/api/placement/jobs/${job._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: title.trim(),
          jobType,
          location: location.trim(),
          description: description.trim(),
          formLink: formLink.trim(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        onUpdated?.(data.data);
        onClose();
      } else {
        toast.error(data.message || "Update failed");
      }
    } catch {
      toast.error("Server error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="nc-overlay" onClick={onClose} style={{ zIndex: 4000 }}>
      <div className="nc-panel" onClick={(e) => e.stopPropagation()}>
        <div className="nc-panel-handle" />
        <div className="nc-panel-header">
          <span className="nc-panel-title">Edit Job</span>
          <button className="nc-panel-close" onClick={onClose}><FaTimes /></button>
        </div>

        <div className="enm-body">
          <label className="enm-label">Job Title *</label>
          <input
            className="enm-textarea"
            style={{ height: "auto" }}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Frontend Developer"
          />

          <label className="enm-label enm-label--top">Job Type *</label>
          <select
            className="enm-textarea"
            style={{ height: "auto" }}
            value={jobType}
            onChange={(e) => setJobType(e.target.value)}
          >
            <option value="">Select Job Type</option>
            {JOB_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>

          <label className="enm-label enm-label--top">Location</label>
          <input
            className="enm-textarea"
            style={{ height: "auto" }}
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g. Delhi, India"
          />

          <label className="enm-label enm-label--top">Job Description *</label>
          <textarea
            className="enm-textarea"
            rows={4}
            maxLength={500}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Write job description..."
          />

          <label className="enm-label enm-label--top">Application Form Link</label>
          <input
            className="enm-textarea"
            style={{ height: "auto" }}
            value={formLink}
            onChange={(e) => setFormLink(e.target.value)}
            placeholder="e.g. https://forms.gle/xxxxx"
          />

          <button
            className="enm-save-btn"
            onClick={handleUpdate}
            disabled={saving}
          >
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}