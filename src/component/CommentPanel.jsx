import React, { useState, useEffect, useRef } from "react";
import { FaTimes, FaPaperPlane } from "react-icons/fa";
import API_BASE_URL from "../config/api.js";
import { getUser, fmt } from "../newsHelpers.js";

/**
 * CommentPanel
 * Slide-up comment sheet — fetch, list, add comment.
 * Shared by News.jsx aur NewsCardWithActions.jsx.
 */
export default function CommentPanel({ newsId, onClose }) {
  const user = getUser();
  const userId = user?.societyId || user?.id;

  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const inputRef = useRef();

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/news/comment/${newsId}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setComments(d.comments);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
    setTimeout(() => inputRef.current?.focus(), 300);
  }, [newsId]);

  const submit = async (e) => {
    e.preventDefault();
    if (!text.trim() || !user) return;
    setPosting(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/api/news/comment/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          newsId,
          userId,
          userName: user.name || user.email || "User",
          text: text.trim(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setComments(data.comments);
        setText("");
      }
    } catch {
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="nc-overlay" onClick={onClose}>
      <div className="nc-panel" onClick={(e) => e.stopPropagation()}>
        <div className="nc-panel-handle" />
        <div className="nc-panel-header">
          <span className="nc-panel-title">
            Comments <span className="nc-badge">{comments.length}</span>
          </span>
          <button className="nc-panel-close" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <div className="nc-comments-list">
          {loading && (
            <div className="nc-spinner-wrap">
              <div className="nc-spinner" />
            </div>
          )}
          {!loading && comments.length === 0 && (
            <p className="nc-empty-text">No comments yet. Be the first!</p>
          )}
          
          {comments.map((c) => (
            <div key={c._id} className="nc-comment-item">
              <div className="nc-comment-avatar">
                {c.profilePic ? (
                  <img
                    src={c.profilePic}
                    alt={c.userName}
                    style={{
                      width: "100%",
                      height: "100%",
                      borderRadius: "50%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  (c.userName || "U")[0].toUpperCase()
                )}
              </div>
              <div className="nc-comment-body">
                <span className="nc-comment-author">
                  {c.userName || c.userId}
                </span>
                <p className="nc-comment-text">{c.text}</p>
                <span className="nc-comment-date">{fmt(c.createdAt)}</span>
              </div>
            </div>
          ))}
        </div>

        <form className="nc-comment-form" onSubmit={submit}>
          <input
            ref={inputRef}
            className="nc-comment-input"
            placeholder={user ? "Add a comment…" : "Log in to comment"}
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={!user || posting}
            maxLength={300}
          />
          <button
            className="nc-comment-send"
            type="submit"
            disabled={!text.trim() || posting || !user}
          >
            {posting ? "…" : <FaPaperPlane />}
          </button>
        </form>
      </div>
    </div>
  );
}