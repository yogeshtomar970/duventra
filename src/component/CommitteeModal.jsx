import React, { useState } from "react";
import API_BASE_URL from "../config/api.js";
import "../styles/CommitteeModal.css";
import { toast } from "react-toastify";
import confirmToast from "../utils/confirmToast.jsx";
const getImageUrl = (url, fallback) => {
  if (!url) return fallback;
  if (url.startsWith("http")) return url;
  return `${API_BASE_URL}${url}`;
};

const DEFAULT_AVATAR = "https://randomuser.me/api/portraits/men/1.jpg";

const POST_OPTIONS = [
  "President", "Vice President", "Secretary", "Joint Secretary",
  "Treasurer", "Marketing Head", "Finance Head",
  "Public Relations (PR) Head", "Creative Head", "Content Head",
  "Logistics Head",
];

export default function CommitteeModal({ committee, onClose, onSocietyUpdate }) {
  const [mode, setMode] = useState("manage");
  const [searchType, setSearchType] = useState("id");
  const [searchId, setSearchId] = useState("");
  const [searchName, setSearchName] = useState("");
  const [nameResults, setNameResults] = useState([]);
  const [foundStudent, setFoundStudent] = useState(null);
  const [selectedPost, setSelectedPost] = useState("");

  const resetSearch = () => {
    setFoundStudent(null);
    setNameResults([]);
    setSearchId("");
    setSearchName("");
    setSelectedPost("");
  };

  const handleSearchById = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/student/${searchId}`);
      const data = await res.json();
      if (data.success) {
        setFoundStudent(data.data);
        setNameResults([]);
      } else {
        toast.error("Student not found");
      }
    } catch {}
  };

  const handleSearchByName = async () => {
    if (searchName.trim().length < 2) return toast.info("Write at least 2 characters.");
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/student/search/by-name?name=${encodeURIComponent(searchName)}`
      );
      const data = await res.json();
      if (data.success) {
        setNameResults(data.data);
        setFoundStudent(null);
      } else {
        toast.error("No student was found.");
      }
    } catch {}
  };

  const handleAddCommittee = async () => {
    const user = JSON.parse(localStorage.getItem("user"));
    try {
      const res = await fetch(`${API_BASE_URL}/api/society/committee/${user.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId: foundStudent._id, post: selectedPost }),
      });
      const data = await res.json();
      if (data.success) {
        onSocietyUpdate(data.data);
        onClose();
        resetSearch();
      }
    } catch {}
  };

  const handleRemove = async (studentId) => {
    if (!(await confirmToast("Do you want to remove this member from the committee?"))) return;
    const user = JSON.parse(localStorage.getItem("user"));
    try {
      const res = await fetch(`${API_BASE_URL}/api/society/committee/${user.id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId }),
      });
      const data = await res.json();
      if (data.success) {
        onSocietyUpdate(data.data);
      } else {
         toast.error(data.message || "Remove failed");
      }
    } catch {
      toast.error("Server error");
    }
  };

  return (
    <div className="cm2-overlay">
      <div className="cm2-modal">

        {/* ── MANAGE MODE ── */}
        {mode === "manage" && (
          <>
            {/* Header */}
            <div className="cm2-header">
              <div className="cm2-header-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#b5651d" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              </div>
              <div>
                <p className="cm2-header-title">Society Committee</p>
                <p className="cm2-header-sub">Manage current members</p>
              </div>
            </div>

            {/* Body */}
            <div className="cm2-body">
              <button
                className="cm2-add-btn"
                onClick={() => { setMode("add"); resetSearch(); }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="12" y1="5" x2="12" y2="19"/>
                  <line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                Add New Member
              </button>

              {!committee?.length ? (
                <p className="cm2-empty">There are no members yet.</p>
              ) : (
                <div className="cm2-list">
                  {committee.map((member, index) => (
                    <div className="cm2-row" key={index}>
                      <img
                        src={getImageUrl(member.studentId?.profilePic, DEFAULT_AVATAR)}
                        className="cm2-avatar"
                        alt=""
                      />
                      <div className="cm2-info">
                        <p className="cm2-name">{member.studentId?.name}</p>
                        <p className="cm2-post">{member.post}</p>
                      </div>
                      <button
                        className="cm2-del-btn"
                        onClick={() => handleRemove(member.studentId?._id)}
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2">
                          <polyline points="3 6 5 6 21 6"/>
                          <path d="M19 6l-1 14H6L5 6"/>
                          <path d="M10 11v6M14 11v6"/>
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <button
                className="cm2-close-btn"
                onClick={() => { onClose(); resetSearch(); }}
              >
                Close
              </button>
            </div>
          </>
        )}

        {/* ── ADD MODE ── */}
        {mode === "add" && (
          <>
            {/* Header */}
            <div className="cm2-header">
              <div className="cm2-header-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#b5651d" strokeWidth="2">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="8.5" cy="7" r="4"/>
                  <line x1="20" y1="8" x2="20" y2="14"/>
                  <line x1="23" y1="11" x2="17" y2="11"/>
                </svg>
              </div>
              <div>
                <p className="cm2-header-title">Add Member</p>
                <p className="cm2-header-sub">Search and assign a post</p>
              </div>
            </div>

            {/* Body */}
            <div className="cm2-body">
              <button className="cm2-back-btn" onClick={() => setMode("manage")}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="15 18 9 12 15 6"/>
                </svg>
                Back to members
              </button>

              <div className="cm2-divider" />

              <p className="cm2-field-label">Search by</p>
              <div className="cm2-toggle-wrap">
                <button
                  className={`cm2-tog ${searchType === "id" ? "cm2-tog-active" : ""}`}
                  onClick={() => { setSearchType("id"); resetSearch(); }}
                >
                  Student ID
                </button>
                <button
                  className={`cm2-tog ${searchType === "name" ? "cm2-tog-active" : ""}`}
                  onClick={() => { setSearchType("name"); resetSearch(); }}
                >
                  Name
                </button>
              </div>

              {searchType === "id" && (
                <>
                  <p className="cm2-field-label">Student ID</p>
                  <input
                    className="cm2-input"
                    type="text"
                    placeholder="e.g. STU2024001"
                    value={searchId}
                    onChange={(e) => setSearchId(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearchById()}
                  />
                  <button className="cm2-search-btn" onClick={handleSearchById}>
                    Search Student
                  </button>
                </>
              )}

              {searchType === "name" && (
                <>
                  <p className="cm2-field-label">Student Name</p>
                  <input
                    className="cm2-input"
                    type="text"
                    placeholder="Enter the name of the student..."
                    value={searchName}
                    onChange={(e) => setSearchName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearchByName()}
                  />
                  <button className="cm2-search-btn" onClick={handleSearchByName}>
                    Search Student
                  </button>

                  {nameResults.length > 0 && !foundStudent && (
                    <div className="cm2-results">
                      {nameResults.map((s) => (
                        <div
                          key={s._id}
                          className="cm2-result-row"
                          onClick={() => { setFoundStudent(s); setNameResults([]); }}
                        >
                          <img
                            src={getImageUrl(s.profilePic, DEFAULT_AVATAR)}
                            className="cm2-result-img"
                            alt=""
                          />
                          <div>
                            <p className="cm2-name">{s.name}</p>
                            <p className="cm2-post">{s.userId}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}

              {foundStudent && (
                <>
                  <div className="cm2-divider" />
                  <p className="cm2-field-label">Student found</p>
                  <div className="cm2-preview">
                    <img
                      src={getImageUrl(foundStudent.profilePic, DEFAULT_AVATAR)}
                      className="cm2-preview-img"
                      alt=""
                    />
                    <div style={{ flex: 1 }}>
                      <p className="cm2-name">{foundStudent.name}</p>
                      <p className="cm2-post">{foundStudent.userId}</p>
                    </div>
                    <button className="cm2-clear-btn" onClick={() => setFoundStudent(null)}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2.5">
                        <line x1="18" y1="6" x2="6" y2="18"/>
                        <line x1="6" y1="6" x2="18" y2="18"/>
                      </svg>
                    </button>
                  </div>

                  <p className="cm2-field-label">Assign post</p>
                  <select
                    className="cm2-select"
                    value={selectedPost}
                    onChange={(e) => setSelectedPost(e.target.value)}
                  >
                    <option value="">Select a post</option>
                    {POST_OPTIONS.map((p) => <option key={p}>{p}</option>)}
                  </select>

                  <button className="cm2-save-btn" onClick={handleAddCommittee}>
                    Save Member
                  </button>
                </>
              )}
            </div>
          </>
        )}

      </div>
    </div>
  );
}
