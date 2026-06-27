import React, { useState } from "react";
import API_BASE_URL from "../config/api.js";
import "../styles/EditProfileModal.css";

export default function EditProfileModal({ onClose, onSocietyUpdate, society }) {
  const [modalType, setModalType] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [bio, setBio] = useState(society?.bio || "");

  const handleSaveImage = async () => {
    if (!selectedImage) return alert("Select image first");
    const user = JSON.parse(localStorage.getItem("user"));
    const formData = new FormData();
    formData.append("profilePic", selectedImage);
    try {
      const res = await fetch(`${API_BASE_URL}/api/society/update/${user.id}`, {
        method: "PUT",
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        alert("Profile image updated");
        onSocietyUpdate(data.data);
        onClose();
      }
    } catch (error) {}
  };

  const handleSaveBio = async () => {
    const user = JSON.parse(localStorage.getItem("user"));
    try {
      const res = await fetch(`${API_BASE_URL}/api/society/update/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bio }),
      });
      const data = await res.json();
      if (data.success) {
        alert("Bio updated");
        onSocietyUpdate(data.data);
        onClose();
      }
    } catch (error) {}
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>

        {/* ── HOME: Choose what to edit ── */}
        {!modalType && (
          <>
            <div className="modal-header">
              <div className="modal-header-icon">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#b5651d" strokeWidth="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
              </div>
              <div>
                <p className="modal-header-title">Edit Profile</p>
                <p className="modal-header-sub">Choose what to update</p>
              </div>
            </div>

            <div className="modal-body">
              <button className="modal-option-btn" onClick={() => setModalType("image")}>
                <div className="modal-option-icon">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#b5651d" strokeWidth="2">
                    <rect x="3" y="3" width="18" height="18" rx="2"/>
                    <circle cx="12" cy="10" r="3"/>
                    <path d="M6 21c0-3.31 2.69-6 6-6s6 2.69 6 6"/>
                  </svg>
                </div>
                <div>
                  <p className="modal-option-title">Profile Image</p>
                  <p className="modal-option-sub">Upload a new photo</p>
                </div>
              </button>

              <button className="modal-option-btn" onClick={() => setModalType("bio")}>
                <div className="modal-option-icon">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#b5651d" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                    <line x1="16" y1="13" x2="8" y2="13"/>
                    <line x1="16" y1="17" x2="8" y2="17"/>
                  </svg>
                </div>
                <div>
                  <p className="modal-option-title">Bio</p>
                  <p className="modal-option-sub">Write about your society</p>
                </div>
              </button>

              <div className="modal-divider" />
              <button className="close-btn" onClick={onClose}>Cancel</button>
            </div>
          </>
        )}

        {/* ── IMAGE UPLOAD ── */}
        {modalType === "image" && (
          <>
            <div className="modal-header">
              <div className="modal-header-icon">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#b5651d" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="2"/>
                  <circle cx="12" cy="10" r="3"/>
                  <path d="M6 21c0-3.31 2.69-6 6-6s6 2.69 6 6"/>
                </svg>
              </div>
              <div>
                <p className="modal-header-title">Profile Image</p>
                <p className="modal-header-sub">Upload a new photo</p>
              </div>
            </div>

            <div className="modal-body">
              <label className="modal-file-area">
                <div className="modal-file-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#b5651d" strokeWidth="2">
                    <polyline points="16 16 12 12 8 16"/>
                    <line x1="12" y1="12" x2="12" y2="21"/>
                    <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
                  </svg>
                </div>
                <p className="modal-file-text">Click to select an image</p>
                <p className="modal-file-hint">JPG, PNG up to 5MB</p>
                <input
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={(e) => setSelectedImage(e.target.files[0])}
                />
              </label>

              {selectedImage && (
                <p className="selected-file-name">Selected: {selectedImage.name}</p>
              )}

              <button className="modal-btn" onClick={handleSaveImage}>Save Image</button>
              <button className="close-btn" onClick={() => setModalType(null)}>Back</button>
            </div>
          </>
        )}

        {/* ── BIO ── */}
        {modalType === "bio" && (
          <>
            <div className="modal-header">
              <div className="modal-header-icon">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#b5651d" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                </svg>
              </div>
              <div>
                <p className="modal-header-title">Add Bio</p>
                <p className="modal-header-sub">Write about your society</p>
              </div>
            </div>

            <div className="modal-body">
              <label className="modal-field-label">Bio</label>
              <textarea
                className="bio-input"
                placeholder="Write your bio here..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              />
              <button className="modal-btn" onClick={handleSaveBio}>Save Bio</button>
              <button className="close-btn" onClick={() => setModalType(null)}>Back</button>
            </div>
          </>
        )}

      </div>
    </div>
  );
}
