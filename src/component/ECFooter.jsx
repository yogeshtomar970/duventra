import React from "react";
import { toast } from "react-toastify";

import {
  FaHeart,
  FaRegHeart,
  FaCommentDots,
  FaShareAlt,
  FaInfoCircle,
  FaEye,
  FaLink,
} from "react-icons/fa";
import "../styles/ECFooter.css";

// Agar link me http:// ya https:// nahi hai to browser use current
// domain ke relative path samajh leta hai — isliye yahan protocol
// add kar dete hain taaki link hamesha alag tab me, apne domain pe open ho
const getSafeExternalLink = (url) => {
  if (!url) return "";
  const trimmed = url.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
};

export default function ECFooter({
  liked,
  likeCount,
  likeLoading,
  commentCount,
  views,
  formLink,
  user,
  onLike,
  onCommentClick,
  onShareClick,
  onDescriptionClick,
}) {
  return (
    <div className="ec-footer">
      <div className="ec-actions">

        {/* Like */}
        <button
          className={`ec-action-btn like-action${liked ? " liked" : ""}`}
          onClick={onLike}
          disabled={likeLoading}
          title={user ? (liked ? "Unlike" : "Like") : "Login to like"}
        >
          {liked ? <FaHeart /> : <FaRegHeart />}
          <span>{likeCount > 0 ? likeCount : ""}</span>
        </button>

        {/* Comment */}
        <button
          className="ec-action-btn comment-action"
          onClick={() => {
            if (!user) { toast.info("Please log in to comment."); return; }
            onCommentClick();
          }}
          title={user ? "Comment" : "Login to comment"}
        >
          <FaCommentDots />
          <span>{commentCount > 0 ? commentCount : ""}</span>
        </button>

        {/* Share */}
        <button
          className="ec-action-btn share-action"
          onClick={onShareClick}
          title="Share"
        >
          <FaShareAlt />
        </button>

        {/* Description */}
        <span
          className="ec-action-btn ec-info-display"
          title="Description"
          onClick={onDescriptionClick}
        >
          <FaInfoCircle />
        </span>

        {/* Form Link */}
        {formLink && (
          <a
            className="ec-action-btn"
            href={getSafeExternalLink(formLink)}
            target="_blank"
            rel="noopener noreferrer"
            title="Register / Form Link"
          >
            <FaLink className="formlink" />
          </a>
        )}
      </div>

      {/* Views */}
      <span className="ec-action-btn ec-views-display" title="Views">
        <FaEye />
        <span className="ec-views-count">{views || 0}</span>
      </span>
    </div>
  );
}