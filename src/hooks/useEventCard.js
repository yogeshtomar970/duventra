import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import API_BASE_URL from "../config/api.js";

/**
 * useEventCard
 * Saari API calls aur state ek jagah —
 * likes, comments count, join status, view register.
 */
export default function useEventCard({ postId, societyId }) {
  // ── Current user ──────────────────────────────────────
  const user = JSON.parse(localStorage.getItem("user")) || null;
  const role = user?.role; // "student" | "society" | undefined

  // Unique ID for like / comment attribution
  const myId = user ? (role === "society" ? user.societyId : user.id) : null;

  // Unique ID for join check
  const myJoinId =
    role === "society"
      ? user?.societyId
      : role === "student"
      ? `student_${user?.id}`
      : null;

  const showJoinBtn =
    !!myJoinId &&
    myJoinId !== societyId &&
    myJoinId !== `student_${societyId}`;

  // ── State ─────────────────────────────────────────────
  const [likeCount, setLikeCount] = useState(0);
  const [liked, setLiked] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);
  const [commentCount, setCommentCount] = useState(0);
  const [isJoined, setIsJoined] = useState(false);

  // ── Register view — PUT, but public action, token optional ──
  useEffect(() => {
    if (!postId) return;
    fetch(`${API_BASE_URL}/api/post/view/${postId}`, { method: "PUT" }).catch(() => {});
  }, [postId]);

  // ── Fetch comment count — GET, token nahi chahiye ────
  useEffect(() => {
    if (!postId) return;
    fetch(`${API_BASE_URL}/api/comment/${postId}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setCommentCount(d.count ?? d.comments?.length ?? 0);
      })
      .catch(() => {});
  }, [postId]);

  // ── Fetch like state — GET, token nahi chahiye ────────
  useEffect(() => {
    if (!postId || !myId) return;
    fetch(`${API_BASE_URL}/api/like/${postId}/${myId}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setLikeCount(d.count);
          setLiked(d.liked);
        }
      })
      .catch(() => {});
  }, [postId, myId]);

  // ── Fetch join status — GET, token nahi chahiye ───────
  useEffect(() => {
    if (!showJoinBtn || !myJoinId) return;
    fetch(`${API_BASE_URL}/api/join/check/${myJoinId}/${societyId}`)
      .then((r) => r.json())
      .then((d) => setIsJoined(d.joined))
      .catch(() => {});
  }, [societyId, showJoinBtn, myJoinId]);

  // ── Handle like ────────────────────────────────────────
  const handleLike = async () => {
    if (!user) { toast.info("Please log in to like posts."); return; }
    if (!myId || likeLoading) return;

    const token = localStorage.getItem("token");
    setLikeLoading(true);
    const wasLiked = liked;
    setLiked(!wasLiked);
    setLikeCount((c) => (wasLiked ? Math.max(0, c - 1) : c + 1));

    try {
      const res = await fetch(`${API_BASE_URL}/api/like/toggle`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ userId: myId, postId }),
      });
      const d = await res.json();
      setLiked(d.liked);
      setLikeCount(d.count);
    } catch {
      setLiked(wasLiked);
      setLikeCount((c) => (wasLiked ? c + 1 : Math.max(0, c - 1)));
    } finally {
      setLikeLoading(false);
    }
  };

  // ── Handle join ────────────────────────────────────────
  const handleJoin = async () => {
    if (!myJoinId) return;
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_BASE_URL}/api/join/join`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ myId: myJoinId, targetId: societyId }),
      });
      const d = await res.json();
      if (d.joined) setIsJoined(true);
    } catch {}
  };

  // ── Handle unjoin ──────────────────────────────────────
  const handleUnjoin = async () => {
    if (!myJoinId) return;
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_BASE_URL}/api/join/unjoin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ myId: myJoinId, targetId: societyId }),
      });
      const d = await res.json();
      if (!d.joined) setIsJoined(false);
    } catch {}
  };

  return {
    user,
    myId,
    showJoinBtn,
    likeCount,
    liked,
    likeLoading,
    commentCount,
    isJoined,
    handleLike,
    handleJoin,
    handleUnjoin,
  };
}
