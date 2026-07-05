import React from "react";
import { useNavigate } from "react-router-dom";
import { resolveImg } from "../newsHelpers.js";

import CommentPanel from "./CommentPanel";
import ShareSheet from "./ShareSheet";
import ImageViewer from "./ImageViewer";
import EditNewsModal from "./EditNewsModal";
import DotMenu from "./DotMenu";
import NewsCardActions from "./NewsCardActions";

import useNewsCard from "../hooks/useNewsCard";

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

  if (!item) return null;

  const imgSrc    = resolveImg(item.image);
  const authorImg = resolveImg(item.userImage);
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
          liked={liked} likes={likes} commentCount={commentCount}
          userId={userId} imgSrc={imgSrc} likeLoading={likeLoading}
          onLike={handleLike}
          onComment={() => setShowComments(true)}
          onShare={() => setShowShare(true)}
          onImage={() => setShowImage(true)}
        />
      </article>

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
