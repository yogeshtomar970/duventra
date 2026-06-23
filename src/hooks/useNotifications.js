import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../SocketContext";
import { BASE_URL } from "../notificationHelpers.js";

export default function useNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount,   setUnreadCount]   = useState(0);
  const [loading,       setLoading]       = useState(true);
  const [activeTab,     setActiveTab]     = useState("all");
  const [selectMode,    setSelectMode]    = useState(false);
  const [selectedIds,   setSelectedIds]   = useState(new Set());

  const navigate = useNavigate();
  const socket   = useSocket();

  const user   = JSON.parse(localStorage.getItem("user") || "null");
  const userId = user?.societyId || user?.id || null;

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchNotifications = useCallback(async () => {
    if (!userId) { setLoading(false); return; }
    try {
      setLoading(true);
      const res  = await fetch(`${BASE_URL}/api/notification/${userId}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.notifications)) {
        setNotifications(data.notifications);
        setUnreadCount(data.notifications.filter((n) => !n.isRead).length);
      }
    } catch (err) {
      console.error("Notification fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  // ── Real-time socket ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!socket) return;
    const handler = (notif) => {
      setNotifications((prev) => [notif, ...prev]);
      setUnreadCount((c) => c + 1);
    };
    socket.on("new_notification", handler);
    return () => socket.off("new_notification", handler);
  }, [socket]);

  // ── Mark one read ──────────────────────────────────────────────────────────
  const markOneRead = async (id) => {
    try {
      await fetch(`${BASE_URL}/api/notification/read/${id}`, { method: "PUT" });
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch (err) { console.error(err); }
  };

  // ── Mark all read ──────────────────────────────────────────────────────────
  const markAllRead = async () => {
    if (!userId) return;
    try {
      await fetch(`${BASE_URL}/api/notification/read-all`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipientId: userId }),
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) { console.error(err); }
  };

  // ── Select mode toggle ─────────────────────────────────────────────────────
  const toggleSelectMode = () => {
    setSelectMode((prev) => !prev);
    setSelectedIds(new Set());
  };

  const toggleSelectOne = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    setSelectedIds(new Set(displayed.map((n) => n._id)));
  };

  const deselectAll = () => setSelectedIds(new Set());

  // ── Delete selected ────────────────────────────────────────────────────────
  const deleteSelected = async () => {
    if (selectedIds.size === 0) return;
    const ids = Array.from(selectedIds);
    try {
      await fetch(`${BASE_URL}/api/notification/delete-selected`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });
      setNotifications((prev) => prev.filter((n) => !selectedIds.has(n._id)));
      setUnreadCount((c) =>
        Math.max(0, c - notifications.filter((n) => selectedIds.has(n._id) && !n.isRead).length)
      );
      setSelectedIds(new Set());
      setSelectMode(false);
    } catch (err) { console.error(err); }
  };

  // ── Delete all ─────────────────────────────────────────────────────────────
  const deleteAll = async () => {
    if (!userId) return;
    try {
      await fetch(`${BASE_URL}/api/notification/delete-all`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipientId: userId }),
      });
      setNotifications([]);
      setUnreadCount(0);
      setSelectedIds(new Set());
      setSelectMode(false);
    } catch (err) { console.error(err); }
  };

  // ── Card click → go to content ────────────────────────────────────────────
  const handleNotifClick = async (note) => {
    if (selectMode) { toggleSelectOne(note._id); return; }
    if (!note.isRead) await markOneRead(note._id);
    if (note.sourceType === "news" && note.postId) {
      navigate("/news", { state: { scrollToNewsId: note.postId } });
    } else if (note.postId) {
      navigate("/", { state: { scrollToPostId: note.postId } });
    }
  };

  // ── Avatar click → go to actor profile ────────────────────────────────────
  const handleAvatarClick = async (e, note) => {
    e.stopPropagation();
    if (selectMode) { toggleSelectOne(note._id); return; }
    if (!note.isRead) await markOneRead(note._id);
    if (note.actorRole === "student") {
      navigate(`/student-profile?id=${note.actorId}`);
    } else if (note.actorRole === "society") {
      navigate(`/society-profile?id=${note.actorId}`);
    }
  };

  // ── Derived ───────────────────────────────────────────────────────────────
  const displayed = activeTab === "all"
    ? notifications
    : notifications.filter((n) => n.type === activeTab);

  const tabUnread = (tab) =>
    tab === "all"
      ? notifications.filter((n) => !n.isRead).length
      : notifications.filter((n) => n.type === tab && !n.isRead).length;

  const allSelected = displayed.length > 0 && displayed.every((n) => selectedIds.has(n._id));

  return {
    userId, loading, activeTab, setActiveTab,
    displayed, unreadCount, tabUnread,
    markAllRead, handleNotifClick, handleAvatarClick,
    // Select mode
    selectMode, selectedIds, allSelected,
    toggleSelectMode, toggleSelectOne,
    selectAll, deselectAll,
    deleteSelected, deleteAll,
  };
}

  const navigate = useNavigate();
  const socket   = useSocket();

  const user   = JSON.parse(localStorage.getItem("user") || "null");
  const userId = user?.societyId || user?.id || null;

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchNotifications = useCallback(async () => {
    if (!userId) { setLoading(false); return; }
    try {
      setLoading(true);
      const res  = await fetch(`${BASE_URL}/api/notification/${userId}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.notifications)) {
        setNotifications(data.notifications);
        setUnreadCount(data.notifications.filter((n) => !n.isRead).length);
      }
    } catch (err) {
      console.error("Notification fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  // ── Real-time socket ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!socket) return;
    const handler = (notif) => {
      setNotifications((prev) => [notif, ...prev]);
      setUnreadCount((c) => c + 1);
    };
    socket.on("new_notification", handler);
    return () => socket.off("new_notification", handler);
  }, [socket]);

  // ── Mark one read ──────────────────────────────────────────────────────────
  const markOneRead = async (id) => {
    try {
      await fetch(`${BASE_URL}/api/notification/read/${id}`, { method: "PUT" });
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch (err) { console.error(err); }
  };

  // ── Mark all read ──────────────────────────────────────────────────────────
  const markAllRead = async () => {
    if (!userId) return;
    try {
      await fetch(`${BASE_URL}/api/notification/read-all`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipientId: userId }),
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) { console.error(err); }
  };

  // ── Card click → go to content ────────────────────────────────────────────
  const handleNotifClick = async (note) => {
    if (!note.isRead) await markOneRead(note._id);
    if (note.sourceType === "news" && note.postId) {
      navigate("/news", { state: { scrollToNewsId: note.postId } });
    } else if (note.postId) {
      navigate("/", { state: { scrollToPostId: note.postId } });
    }
  };

  // ── Avatar click → go to actor profile ────────────────────────────────────
  const handleAvatarClick = async (e, note) => {
    e.stopPropagation();
    if (!note.isRead) await markOneRead(note._id);
    if (note.actorRole === "student") {
      navigate(`/student-profile?id=${note.actorId}`);
    } else if (note.actorRole === "society") {
      navigate(`/society-profile?id=${note.actorId}`);
    }
  };

  // ── Derived ───────────────────────────────────────────────────────────────
  const displayed = activeTab === "all"
    ? notifications
    : notifications.filter((n) => n.type === activeTab);

  const tabUnread = (tab) =>
    tab === "all"
      ? notifications.filter((n) => !n.isRead).length
      : notifications.filter((n) => n.type === tab && !n.isRead).length;

  return {
    userId, loading, activeTab, setActiveTab,
    displayed, unreadCount, tabUnread,
    markAllRead, handleNotifClick, handleAvatarClick,
  };


