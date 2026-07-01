import React, { forwardRef, useState, useRef, useEffect } from "react"; // ← forwardRef add
import { FaTrash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { resolveImg, fmt } from "../newsHelpers.js";
import CommentPanel    from "./CommentPanel";
import ShareSheet      from "./ShareSheet";
import ImageViewer     from "./ImageViewer";
import NewsCardActions from "./NewsCardActions";
import useNewsCard     from "../hooks/useNewsCard";

const COLLAPSED_HEIGHT = 55; // px — same as before

const NewsCard = forwardRef(function NewsCard({ data, highlighted, onDelete }, ref) {
  const navigate = useNavigate();
  const {
    userId, liked, likes, commentCount, likeLoading,
    showComments, setShowComments,
    showShare, setShowShare,
    showImage, setShowImage,
    handleLike, handleDelete, canModify,
  } = useNewsCard({ item: data, onDeleted: onDelete });

  const [expanded, setExpanded]   = useState(false);
  const [overflow, setOverflow]   = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const descRef = useRef(null);

  // Check if text overflows collapsed height
  useEffect(() => {
    if (descRef.current) {
      setOverflow(descRef.current.scrollHeight > COLLAPSED_HEIGHT + 4);
    }
  }, [data?.description]);

  if (!data) return null;

  const imgSrc    = resolveImg(data.image);
  const authorImg = resolveImg(data.userImage);

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
    if (!data.recipientId) return;
    if (data.uploadedBy === "society") {
      navigate(`/society-profile?id=${data.recipientId}`);
    } else {
      navigate(`/student-profile?id=${data.recipientId}`);
    }
  };

  return (
    <>
      <article
        ref={ref}
        id={`news-${data._id}`}
        className={`nc-cards${highlighted ? " nc-card--highlight" : ""}`}
      >
        {/* Header */}
        <div className="nc-card-header">
          <div className="nc-author-row"
            onClick={handleAuthorClick}
            style={{ cursor: data.recipientId ? "pointer" : "default" }}
          >
            {authorImg
              ? <img src={authorImg} alt={data.userName} className="nc-author-avatar" />
              : <div className="nc-author-avatar nc-avatar-fallback">
                  {(data.userName || "U")[0].toUpperCase()}
                </div>
            }
            <div className="nc-author-info">
              <span className="nc-author-name">{data.userName || data.uploadedBy}</span>
              <span className="nc-author-role">{data.uploadedBy}</span>
            </div>
          </div>
          <div className="nc-header-right">
            <span className="nc-card-date">{fmt(data.createdAt)}</span>
            {canModify && (
              <button className="nc-delete-btn" onClick={handleDelete} title="Delete">
                <FaTrash />
              </button>
            )}
          </div>
        </div>

        {/* Description */}
        <div className="nc-desc-wrap">
          <p
            ref={descRef}
            className="nc-card-desc"
            style={{ maxHeight: expanded ? "none" : COLLAPSED_HEIGHT, overflow: "hidden" }}
          >
            {data.description}
          </p>
          {overflow && (
            <button className="nc-read-more-btn" onClick={handleReadMore}>
              {expanded ? "Read less ▲" : "Read more ▼"}
            </button>
          )}
        </div>

        {/* Actions */}
        <NewsCardActions
          liked={liked}
          likes={likes}
          commentCount={commentCount}
          userId={userId}
          imgSrc={imgSrc}
          likeLoading={likeLoading}
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
              <div className="nc-author-row" onClick={handleAuthorClick} style={{ cursor: data.recipientId ? "pointer" : "default" }}>
                {authorImg
                  ? <img src={authorImg} alt={data.userName} className="nc-author-avatar" />
                  : <div className="nc-author-avatar nc-avatar-fallback">{(data.userName || "U")[0].toUpperCase()}</div>
                }
                <div className="nc-author-info">
                  <span className="nc-author-name">{data.userName || data.uploadedBy}</span>
                  <span className="nc-author-role">{data.uploadedBy}</span>
                </div>
              </div>
              <button className="nc-popup-close" onClick={() => setShowPopup(false)}>✕</button>
            </div>
            <div className="nc-popup-body">
              <p className="nc-popup-desc">{data.description}</p>
            </div>
          </div>
        </div>
      )}

      {showComments && <CommentPanel newsId={data._id} onClose={() => setShowComments(false)} />}
      {showShare    && <ShareSheet   item={data}       onClose={() => setShowShare(false)} />}
      {showImage && imgSrc && <ImageViewer src={imgSrc} onClose={() => setShowImage(false)} />}
    </>
  );
});

export default NewsCard;