import React, { useState, useEffect, forwardRef } from "react"; // ← forwardRef add kiya

// ── Hooks ──────────────────────────────────────────────
import useEventCard from "../hooks/useEventCard.js";
import useShare from "../hooks/useShare.js";

// ── Sub-components ─────────────────────────────────────
import ECPosterImage from "./ECPosterImage.jsx";
import ECHeader from "./ECHeader.jsx";
import ECFooter from "./ECFooter.jsx";
import ECShareSheet from "./ECShareSheet.jsx";
import ECMorePopup from "./ECMorePopup.jsx";
import CommentsCard from "./Comments.jsx";
import DescriptionCard from "./DescriptionCard.jsx";

// ── Card-level CSS ─────────────────────────────────────
import "../styles/EventCard.css";

// ← forwardRef se wrap kiya, ref parameter add kiya
const EventCard = forwardRef(function EventCard({
  profileimg,
  societyname,
  collegename,
  type,
  posterimg,
  time,
  description,
  formLink,
  views,
  postId,
  societyId,
  onEditPost,
  onDeletePost,
  postElementId,
  highlighted,
}, ref) {  // ← ref yahan aaya
  // ── UI state ───────────────────────────────────────
  const [showPopup, setShowPopup] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showDescription, setShowDescription] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [showDotMenu, setShowDotMenu] = useState(false);

  // ── API state + handlers (from hook) ──────────────
  const {
    user,
    showJoinBtn,
    likeCount,
    liked,
    likeLoading,
    commentCount,
    isJoined,
    handleLike,
    handleJoin,
    handleUnjoin,
  } = useEventCard({ postId, societyId });

  // ── Share logic (from hook) ────────────────────────
  const { shareUrl, shareText, copied, copyLink } = useShare(postId);

  // ── Lock body scroll when any overlay is open ──────
  useEffect(() => {
    const anyOpen = showPopup || showComments || showDescription || showShare;
    document.body.style.overflow = anyOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [showPopup, showComments, showDescription, showShare]);

  return (
    <div
      ref={ref}  // ← sirf ye line add ki, baaki sab same
      id={postElementId}
      className={`event-card${highlighted ? " event-card--highlight" : ""}`}
    >
      {/* ── Poster image ── */}
      <ECPosterImage posterimg={posterimg} />

      {/* ── Header (avatar, name, time, dot-menu, join) ── */}
      <ECHeader
        profileimg={profileimg}
        societyname={societyname}
        collegename={collegename}
        type={type}
        time={time}
        societyId={societyId}
        showJoinBtn={showJoinBtn}
        isJoined={isJoined}
        onJoin={handleJoin}
        onUnjoin={handleUnjoin}
        onEditPost={onEditPost}
        onDeletePost={onDeletePost}
        showDotMenu={showDotMenu}
        setShowDotMenu={setShowDotMenu}
      />

      {/* ── Footer (like, comment, share, info, views) ── */}
      <ECFooter
        liked={liked}
        likeCount={likeCount}
        likeLoading={likeLoading}
        commentCount={commentCount}
        views={views}
        formLink={formLink}
        user={user}
        onLike={handleLike}
        onCommentClick={() => setShowComments(true)}
        onShareClick={() => setShowShare(true)}
        onDescriptionClick={() => setShowDescription(true)}
      />

      {/* ── Comments bottom sheet ── */}
      {showComments && (
        <div className="ec-overlay" onClick={() => setShowComments(false)}>
          <div className="ec-sheet" onClick={(e) => e.stopPropagation()}>
            <button
              className="ec-close-btn"
              onClick={() => setShowComments(false)}
              aria-label="Close"
            >
              ✕
            </button>
            <CommentsCard postId={postId} />
          </div>
        </div>
      )}

      {/* ── Description bottom sheet ── */}
      {showDescription && (
        <div className="ec-overlay" onClick={() => setShowDescription(false)}>
          <div className="ec-sheet" onClick={(e) => e.stopPropagation()}>
            <DescriptionCard description={description} formLink={formLink} />
          </div>
        </div>
      )}

      {/* ── More popup ── */}
      {showPopup && (
        <ECMorePopup
          views={views}
          onDescriptionClick={() => setShowDescription(true)}
          onClose={() => setShowPopup(false)}
        />
      )}

      {/* ── Share sheet ── */}
      {showShare && (
        <ECShareSheet
          shareUrl={shareUrl}
          shareText={shareText}
          copied={copied}
          onCopy={copyLink}
          onClose={() => setShowShare(false)}
        />
      )}
    </div>
  );
});

export default EventCard; // ← bahar nikala