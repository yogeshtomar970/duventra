import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import API_BASE_URL from "../config/api.js";
import { getUser } from "../newsHelpers.js";
import confirmToast from "../utils/confirmToast.jsx";

/**
 * useNewsCard
 * Like toggle, delete, aur panel (comments/share/image/edit) open state.
 * News.jsx aur NewsCardWithActions.jsx dono mein reuse hota hai.
 */
export default function useNewsCard({ item, onDeleted }) {
  const user   = getUser();
  const userId = user?.id;                          // hamesha MongoDB _id — delete match karta hai
  const societyId = user?.societyId || null;        // sirf canModify check ke liye

  const [liked,        setLiked]        = useState(false);
  const [likes,        setLikes]        = useState(item?.likeCount || 0);
  const [commentCount, setCommentCount] = useState(item?.commentCount || 0);
  const [likeLoading,  setLikeLoading]  = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showShare,    setShowShare]    = useState(false);
  const [showEdit,     setShowEdit]     = useState(false);
  const [showDotMenu,  setShowDotMenu]  = useState(false);
  const [showImage,    setShowImage]    = useState(false);

  // Fetch initial like state — GET, token nahi chahiye
  useEffect(() => {
    if (!userId || !item?._id) return;
    fetch(`${API_BASE_URL}/api/news/like/${item._id}/${userId}`)
      .then((r) => r.json())
      .then((d) => { setLiked(d.liked); setLikes(d.count); })
      .catch(() => {});
  }, [item._id, userId]);

  const handleLike = async () => {
    if (!userId || likeLoading) return;
    const token = localStorage.getItem("token");
    setLikeLoading(true);
    setLiked((p) => !p);
    setLikes((p) => (liked ? p - 1 : p + 1));
    try {
      const res = await fetch(`${API_BASE_URL}/api/news/like/toggle`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ newsId: item._id, userId }),
      });
      const d = await res.json();
      setLiked(d.liked);
      setLikes(d.count);
    } catch {
      setLiked((p) => !p);
      setLikes((p) => (liked ? p + 1 : p - 1));
    } finally {
      setLikeLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!(await confirmToast("Delete this news post?"))) return;
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_BASE_URL}/api/news/${item._id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ userId }),
      });
      const data = await res.json();
      if (data.success) onDeleted?.(item._id);
      else toast.error(data.message || "Delete failed");
    } catch {
      toast.error("Server error");
    }
  };

  const canModify = userId && (
    userId === String(item.userId) ||
    (societyId && societyId === String(item.recipientId))
  );

  return {
    userId, liked, likes, commentCount,
    likeLoading, showComments, setShowComments,
    showShare, setShowShare, showEdit, setShowEdit,
    showDotMenu, setShowDotMenu, showImage, setShowImage,
    handleLike, handleDelete, canModify,
  };
}
