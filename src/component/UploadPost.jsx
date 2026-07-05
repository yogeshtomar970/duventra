import API_BASE_URL from "../config/api.js";
import React, { useState, useEffect } from "react";
import "../UploadPost.css";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
export default function UploadPost() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [description, setDescription] = useState("");
  const [formLink, setFormLink] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [eventTypes, setEventTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", ok: true });
  const [startDate, setStartDate] = useState("");
  const [lastDate, setLastDate] = useState("");
  const user = JSON.parse(localStorage.getItem("user")) || null;

  // Guard: only society can upload posts
  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    if (user.role !== "society") {
      toast.error(
        "Only society accounts can upload posts. Students can upload news.",
      );
      navigate("/upload-news");
    }
  }, []);

  const eventOptions = [
    "Fest & Event",
    "Academic Event",
    "Cultural Event",
    "Sports Event",
    "Tech Event",
    "Competition",
    "Debates",
    "Writing",
    "Gaming",
    "Design",
    "Quiz",
    "E-cell",
    "Entrepreneurship",
    "Startup",
    "Internship",
    "Skills",
    "Workshop",
    "Courses",
    "Conference",
    "NCC",
    "Campaigning",
  ];

  const toggleType = (type) => {
    setEventTypes((p) =>
      p.includes(type) ? p.filter((x) => x !== type) : [...p, type],
    );
  };

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setMessage({ text: "Please select an image", ok: false });
      return;
    }
    if (!description) {
      setMessage({ text: "Description is required", ok: false });
      return;
    }
    if (startDate && lastDate && new Date(lastDate) < new Date(startDate)) {
      setMessage({ text: "The last date cannot be earlier than the start date.", ok: false });
      return;
    }
    const token = localStorage.getItem("token");
    setLoading(true);
    setMessage({ text: "", ok: true });

    const formData = new FormData();
    formData.append("file", file);
    formData.append("description", description);
    formData.append("formLink", formLink);
    formData.append("societyId", user.id);
    formData.append("eventTypes", JSON.stringify(eventTypes));
    if (startDate) formData.append("startDate", startDate);
    if (lastDate) formData.append("lastDate", lastDate);

    try {
      const res = await fetch(`${API_BASE_URL}/api/post/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`, // Content-Type mat likho — FormData khud set karta hai
        },
        body: formData,
      });
      const result = await res.json();
      if (res.ok) {
        setMessage({ text: "✅ Post uploaded successfully!", ok: true });
        setTimeout(() => navigate("/"), 1500);
      } else {
        setMessage({ text: result.message || "Upload failed", ok: false });
      }
    } catch {
      setMessage({ text: "Network error — check server", ok: false });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="upload-container">
      <form className="upload-card" onSubmit={handleSubmit}>
        <h2>📸 Upload Post</h2>
        <p className="upload-subtitle">
          Share an event with the campus community
        </p>

        <label>
          Event Image <span className="req">*</span>
        </label>
        <input type="file" accept="image/*" onChange={handleFileChange} />
        {preview && (
          <div className="upload-preview">
            <img src={preview} alt="preview" />
            <button
              type="button"
              className="remove-preview-btn"
              onClick={() => {
                setFile(null);
                setPreview(null);
              }}
            >
              ✕
            </button>
          </div>
        )}

        <label>Event Type(s)</label>
        <div className="dropdowns">
          <div
            className="dropdown-btn"
            onClick={() => setShowDropdown((p) => !p)}
          >
            {eventTypes.length > 0
              ? eventTypes.join(", ")
              : "Select event type(s)"}
          </div>
          {showDropdown && (
            <div className="dropdown-content">
              {eventOptions.map((type) => (
                <label key={type} className="checkbox-item">
                  <input
                    type="checkbox"
                    checked={eventTypes.includes(type)}
                    onChange={() => toggleType(type)}
                  />
                  {type}
                </label>
              ))}
            </div>
          )}
        </div>

        <label>
          Description <span className="req">*</span>
        </label>
        <textarea
          placeholder="Describe your event…"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={500}
        />
        <span className="char-count">{description.length}/500</span>

        <label>
          Registration Form Link <span className="optional">(optional)</span>
        </label>
        <input
          type="url"
          placeholder="https://forms.google.com/…"
          value={formLink}
          onChange={(e) => setFormLink(e.target.value)}
        />
        <div className="upload-date-row">
          <div className="upload-date-field">
            <label>
              Event Start Date <span className="optional">(optional)</span>
            </label>
            <input
              type="date"
              value={startDate}
              min={new Date().toISOString().split("T")[0]}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="upload-date-field">
            <label>
              Event Last Date <span className="optional">(optional)</span>
            </label>
            <input
              type="date"
              value={lastDate}
              min={startDate || new Date().toISOString().split("T")[0]}
              onChange={(e) => setLastDate(e.target.value)}
            />
          </div>
        </div>
        
        {message.text && (
          <p className={message.ok ? "upload-ok" : "upload-err"}>
            {message.text}
          </p>
        )}

        <button type="submit" disabled={loading}>
          {loading ? "Uploading…" : "Publish Post"}
        </button>
      </form>
    </div>
  );
}
