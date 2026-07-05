import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { resolveImg } from "../newsHelpers.js";

import CommentPanel from "./CommentPanel";
import ShareSheet from "./ShareSheet";
import ImageViewer from "./ImageViewer";
import EditNewsModal from "./EditNewsModal";
import DotMenu from "./DotMenu";
import NewsCardActions from "./NewsCardActions";

import useNewsCard from "../hooks/useNewsCard";

const COLLAPSED_HEIGHT = 55; // px — NewsCard se same

export default function NewsCardWithActions({ item, userId, onUpdated, onDeleted }) {
  const navigate = useNavigate();
  const {
    liked, likes, commentCount, likeLoading,
    showComments, setShowComments,
    showShare, setShowShare,
    showEdit, setShowEdit,
    showDotMenu, setShowDotMenu,
    showImage, setShowImage,
    handleLike, handleDelete, canModify,
  } = useNewsCard({ item, onDeleted });

  const [expanded, setExpanded] = useState(false);
  const [overflow, setOverflow] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const descRef = useRef(null);

  useEffect(() => {
    if (descRef.current) {
      setOverflow(descRef.current.scrollHeight > COLLAPSED_HEIGHT + 4);
    }
  }, [item?.description]);

  if (!item) return null;

  const imgSrc    = resolveImg(item.image);
  const authorImg = resolveImg(item.userImage);

  const isMobile = () => window.innerWidth < 768;

  const handleReadMore = (e) => {
    e.stopPropagation();
    if (isMobile()) {
      setExpanded((p) => !p);
    } else {
      setShowPopup(true);
    }
  };

  const handleAuthorClick = () => {
    if (!item.recipientId) return;
    if (item.uploadedBy === "society") {
      navigate(`/society-profile?id=${item.recipientId}`);
    } else {
      navigate(`/student-profile?id=${item.recipientId}`);
    }
  };

  return (
    <>
      <article className="nc-cards">
        {/* Header */}
        <div className="nc-card-header">
          <div className="nc-author-row"
            onClick={handleAuthorClick}
            style={{ cursor: item.recipientId ? "pointer" : "default" }}
          >
            {authorImg ? (
              <img src={authorImg} alt={item.userName} className="nc-author-avatar" />
            ) : (
              <div className="nc-author-avatar nc-avatar-fallback">
                {(item.userName || "U")[0].toUpperCase()}
              </div>
            )}
            <div className="nc-author-info">
              <span className="nc-author-name">{item.userName || item.uploadedBy}</span>
              <span className="nc-author-role">{item.collegeName || item.uploadedBy || ""}</span>
            </div>
          </div>

          <div className="nc-header-right">
            <span className="nc-card-date">
              {new Date(item.createdAt).toLocaleDateString("en-IN", {
                day: "numeric", month: "short", year: "numeric",
              })}
            </span>
            {canModify && (
              <DotMenu
                show={showDotMenu} setShow={setShowDotMenu}
                onEdit={() => setShowEdit(true)}
                onDelete={handleDelete}
              />
            )}
          </div>
        </div>

        {/* Description with Read more */}
        <div className="nc-desc-wrap">
          <p
            ref={descRef}
            className="nc-card-desc"
            style={{ maxHeight: expanded ? "none" : COLLAPSED_HEIGHT, overflow: "hidden" }}
          >
            {item.description}
          </p>
          {overflow && (
            <button className="nc-read-more-btn" onClick={handleReadMore}>
              {expanded ? "Read less ▲" : "Read more ▼"}
            </button>
          )}
        </div>

        {/* Actions */}
        <NewsCardActions
          liked={liked} likes={likes} commentCount={commentCount}
          userId={userId} imgSrc={imgSrc} likeLoading={likeLoading}
          onLike={handleLike}
          onComment={() => setShowComments(true)}
          onShare={() => setShowShare(true)}
          onImage={() => setShowImage(true)}
        />
      </article>

      {/* PC Popup */}
      {showPopup && (
        <div className="nc-popup-overlay" onClick={() => setShowPopup(false)}>
          <div className="nc-popup-box" onClick={(e) => e.stopPropagation()}>
            <div className="nc-popup-header">
              <div className="nc-author-row" onClick={handleAuthorClick} style={{ cursor: item.recipientId ? "pointer" : "default" }}>
                {authorImg
                  ? <img src={authorImg} alt={item.userName} className="nc-author-avatar" />
                  : <div className="nc-author-avatar nc-avatar-fallback">{(item.userName || "U")[0].toUpperCase()}</div>
                }
                <div className="nc-author-info">
                  <span className="nc-author-name">{item.userName || item.uploadedBy}</span>
                  <span className="nc-author-role">{item.collegeName || item.uploadedBy || ""}</span>
                </div>
              </div>
              <button className="nc-popup-close" onClick={() => setShowPopup(false)}>✕</button>
            </div>
            <div className="nc-popup-body">
              <p className="nc-popup-desc">{item.description}</p>
            </div>
          </div>
        </div>
      )}

      {showComments && <CommentPanel newsId={item._id} onClose={() => setShowComments(false)} />}
      {showShare    && <ShareSheet item={item} onClose={() => setShowShare(false)} />}
      {showImage && imgSrc && <ImageViewer src={imgSrc} onClose={() => setShowImage(false)} />}
      {showEdit && (
        <EditNewsModal item={item} userId={userId}
          onUpdated={onUpdated} onClose={() => setShowEdit(false)} />
      )}
    </>
  );
}