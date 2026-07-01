import React from "react";
import { useNavigate } from "react-router-dom";
import { FaCheck } from "react-icons/fa";
import { getTimeAgo } from "../hooks/getTimeAgo.js";
import "../styles/ECHeader.css";

export default function ECHeader({
  profileimg,
  societyname,
  collegename,
  type,
  time,
  societyId,
  showJoinBtn,
  isJoined,
  onJoin,
  onUnjoin,
  onEditPost,
  onDeletePost,
  showDotMenu,
  setShowDotMenu,
}) {
  const navigate = useNavigate();

  const avatarFallback = `https://ui-avatars.com/api/?name=${encodeURIComponent(
    societyname || "S"
  )}&background=0e132f&color=fff&size=60`;

  const handleProfileClick = () => {
    if (societyId) {
      navigate(`/society-profile?id=${societyId}`);
    }
  };

  return (
    <div className="ec-header">
      {/* Society info — click karne par society profile khule */}
      <div
        className="ec-profile-link"
        onClick={handleProfileClick}
        style={{ cursor: societyId ? "pointer" : "default" }}
      >
        <img
          src={profileimg || avatarFallback}
          alt={societyname}
          className="ec-avatar"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = avatarFallback;
          }}
        />
        <div className="ec-meta">
          <span className="ec-society-name">{societyname}</span>
          <span className="ec-college">{collegename}</span>
          <span className="ec-type">{type}</span>
        </div>
      </div>

      {/* Right side — time + dot menu + join */}
      <div className="ec-header-right">
        <span className="ec-time">{getTimeAgo(time)}</span>

        {/* 3-dot menu — only when edit/delete callbacks passed */}
        {(onEditPost || onDeletePost) && (
          <div className="ec-dot-wrap">
            <button
              className="ec-dot-btn"
              onClick={() => setShowDotMenu((v) => !v)}
              title="Options"
            >
              ⋮
            </button>

            {showDotMenu && (
              <>
                {/* backdrop to close menu */}
                <div
                  className="ec-dot-backdrop"
                  onClick={() => setShowDotMenu(false)}
                />
                <div className="ec-dot-menu">
                  {onEditPost && (
                    <button
                      className="ec-dot-item"
                      onClick={() => { setShowDotMenu(false); onEditPost(); }}
                    >
                      Edit
                    </button>
                  )}
                  {onEditPost && onDeletePost && (
                    <div className="ec-dot-divider" />
                  )}
                  {onDeletePost && (
                    <button
                      className="ec-dot-item ec-dot-item--danger"
                      onClick={() => { setShowDotMenu(false); onDeletePost(); }}
                    >
                      Delete
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* Join / Joined button */}
        {showJoinBtn && !isJoined && (
          <button className="join-btn" onClick={onJoin}>Join Us</button>
        )}
        {showJoinBtn && isJoined && (
          <button className="join-btn joined" onClick={onUnjoin}>
            <FaCheck className="tick-icon" /> Joined
          </button>
        )}
      </div>
    </div>
  );
}
