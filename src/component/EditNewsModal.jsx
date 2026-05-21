import React, { useState } from "react";
import { FaTimes } from "react-icons/fa";
import API_BASE_URL from "../config/api.js";
import "../styles/EditNewsModal.css";

/**
 * EditNewsModal
 * Edit description + image for a news item.
 */
export default function EditNewsModal({ item, userId, onUpdated, onClose }) {
  const [editDesc,   setEditDesc]   = useState(item.description || "");
  const [editImage,  setEditImage]  = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [saving,     setSaving]     = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setEditImage(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleUpdate = async () => {
    if (!editDesc.trim()) return alert("Description cannot be empty");
    setSaving(true);
     const token = localStorage.getItem("token");
    try {
      const formData = new FormData();
      formData.append("userId", userId);
      formData.append("description", editDesc.trim());
      if (editImage) formData.append("image", editImage);

      const res  = await fetch(`${API_BASE_URL}/api/news/update/${item._id}`, {
        method: "PUT",
        body: formData,
        headers: {
          "Authorization": `Bearer ${token}`, // Content-Type mat likho — FormData khud set karta hai
        },
      });
      const data = await res.json();
      if (data.success) {
        onUpdated?.({ ...item, description: editDesc, image: data.news?.image || item.image });
        onClose();
      } else {
        alert(data.message || "Update failed");
      }
    } catch { alert("Server error"); }
    finally { setSaving(false); }
  };

  return (
    <div className="nc-overlay" onClick={onClose} style={{ zIndex: 4000 }}>
      <div className="nc-panel" onClick={(e) => e.stopPropagation()}>
        <div className="nc-panel-handle" />
        <div className="nc-panel-header">
          <span className="nc-panel-title">Edit News</span>
          <button className="nc-panel-close" onClick={onClose}><FaTimes /></button>
        </div>

        <div className="enm-body">
          <label className="enm-label">Description *</label>
          <textarea
            className="enm-textarea"
            rows={4}
            value={editDesc}
            onChange={(e) => setEditDesc(e.target.value)}
            placeholder="News description..."
          />

          <label className="enm-label enm-label--top">Image (optional)</label>
          {(previewUrl || item.image) && (
            <img
              src={previewUrl || item.image}
              alt="preview"
              className="enm-preview-img"
            />
          )}
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="enm-file-input"
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
