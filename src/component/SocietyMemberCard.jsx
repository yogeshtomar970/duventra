import React, { useState } from "react";
import API_BASE_URL from "../config/api.js";
import "../styles/SocietyMemberCard.css";

const getImageUrl = (url) => {
  if (!url) return null;
  if (url.startsWith("http")) return url;
  return `${API_BASE_URL}${url}`;
};

const getInitials = (name = "") =>
  name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);

const SECTIONS = [
  { key: "soc-members",  label: "Society Members",     icon: "ti-building-community", isStudent: false },
  { key: "stu-members",  label: "Student Members",     icon: "ti-users",              isStudent: true  },
  { key: "soc-following",label: "Society Following",   icon: "ti-heart",              isStudent: false },
  { key: "stu-following",label: "Student Following",   icon: "ti-user-check",         isStudent: true  },
  { key: "soc-suggest",  label: "Society Suggestions", icon: "ti-bulb",               isStudent: false },
  { key: "stu-suggest",  label: "Student Suggestions", icon: "ti-user-plus",          isStudent: true  },
];

/**
 * SocietyConnectionsPanel
 *
 * Props:
 *  members             society members array
 *  studentMembers      student members array
 *  following           society following array
 *  studentFollowing    student following array
 *  suggestions         society suggestions array
 *  studentSuggestions  student suggestions array
 *
 *  isJoinedSociety(item) => bool
 *  isJoinedStudent(item) => bool
 *
 *  onJoinSociety(item)
 *  onJoinStudent(item)
 *
 *  onSocietyClick(item)
 *  onStudentClick(item)
 */
export default function SocietyConnectionsPanel({
  members = [],
  studentMembers = [],
  following = [],
  studentFollowing = [],
  suggestions = [],
  studentSuggestions = [],
  isJoinedSociety = () => false,
  isJoinedStudent = () => false,
  onJoinSociety,
  onJoinStudent,
  onSocietyClick,
  onStudentClick,
  readOnly = false,
}) {
  const [activeKey, setActiveKey] = useState("soc-members");
  const [search, setSearch] = useState("");

  const dataMap = {
    "soc-members":   { items: members,            isStudent: false },
    "stu-members":   { items: studentMembers,      isStudent: true  },
    "soc-following": { items: following,           isStudent: false },
    "stu-following": { items: studentFollowing,    isStudent: true  },
    "soc-suggest":   { items: suggestions,         isStudent: false },
    "stu-suggest":   { items: studentSuggestions,  isStudent: true  },
  };

  const { items, isStudent } = dataMap[activeKey];

  const filtered = items.filter((item) => {
    const name = isStudent ? item.name : item.societyName;
    return name?.toLowerCase().includes(search.toLowerCase());
  });

  const visibleSections = readOnly
    ? SECTIONS.filter((s) => !s.key.includes("suggest"))
    : SECTIONS;

  const activeSection = visibleSections.find((s) => s.key === activeKey) || visibleSections[0];

  const handleNav = (key) => {
    setActiveKey(key);
    setSearch("");
  };

  const isJoined = (item) =>
    isStudent ? isJoinedStudent(item) : isJoinedSociety(item);

  const handleJoin = (e, item) => {
    e.stopPropagation();
    isStudent ? onJoinStudent?.(item) : onJoinSociety?.(item);
  };

  const handleCardClick = (item) =>
    isStudent ? onStudentClick?.(item) : onSocietyClick?.(item);

  return (
    <div className="scp-root">
      {/* ── Left nav ── */}
      <nav className="scp-nav" aria-label="Connection sections">
        {visibleSections.map((sec) => {
          const count = dataMap[sec.key].items.length;
          return (
            <button
              key={sec.key}
              className={`scp-nav-btn${activeKey === sec.key ? " active" : ""}`}
              onClick={() => handleNav(sec.key)}
            >
              <i className={`ti ${sec.icon}`} aria-hidden="true" />
              <span className="scp-nav-label">{sec.label}</span>
              <span className="scp-badge">{count}</span>
            </button>
          );
        })}
      </nav>

      {/* ── Right panel ── */}
      <div className="scp-panel">
        {/* Header */}
        <div className="scp-panel-header">
          <p className="scp-panel-title">{activeSection.label}</p>
          <div className="scp-search">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="scp-search-input"
            />
            {search && (
              <button className="scp-search-clear" onClick={() => setSearch("")} aria-label="Clear search">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            )}
          </div>
        </div>

        <div className="scp-divider" />

        {/* Cards */}
        {filtered.length === 0 ? (
          <div className="scp-empty">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true" style={{color:"var(--text-muted)"}}>
              <circle cx="12" cy="12" r="10"/><line x1="8" y1="15" x2="16" y2="15"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/>
            </svg>
            <span>{search ? "No results found" : "Nothing here yet"}</span>
          </div>
        ) : (
          <div className="scp-grid">
            {filtered.map((item, i) => {
              const name = isStudent ? item.name : item.societyName;
              const sub1 = item.collegeName || "";
              const sub2 = isStudent
                ? [item.course, item.year ? `${item.year} yr` : ""].filter(Boolean).join(" · ")
                : item.societyType || "";
              const joined = isJoined(item);
              const imgUrl = getImageUrl(item.profilePic);

              return (
                <div className="scp-card" key={i} onClick={() => handleCardClick(item)}>
                  <div className="scp-av">
                    {imgUrl ? (
                      <img src={imgUrl} alt={name} className="scp-av-img" />
                    ) : (
                      <span className="scp-av-init">{getInitials(name)}</span>
                    )}
                  </div>
                  <p className="scp-card-name">{name}</p>
                  {sub1 && <span className="scp-card-sub">{sub1}</span>}
                  {sub2 && <span className="scp-card-sub">{sub2}</span>}
                  {!readOnly && (
                    <button
                      className={`scp-btn${joined ? " scp-btn--joined" : ""}`}
                      onClick={(e) => handleJoin(e, item)}
                    >
                      {joined
                        ? (isStudent ? "Following ✓" : "Joined ✓")
                        : (isStudent ? "Follow" : "Join Us")}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
