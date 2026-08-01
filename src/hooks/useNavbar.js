import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../config/api.js";

/**
 * useNavbar
 * Upload popup open/close, notification unread count polling,
 * outside click close, user/role, navigation.
 */
export default function useNavbar() {
  const [showPopup,   setShowPopup]   = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();
  const popupRef = useRef();

  const user       = JSON.parse(localStorage.getItem("user")) || null;
  const role       = user?.role;
  const recipientId = user?.societyId || user?.userId || null;

  // Fetch unread count on mount + poll every 30s
  useEffect(() => {
    if (!recipientId) return;

    const fetchCount = () => {
      fetch(`${API_BASE_URL}/api/notification/unread/${recipientId}`)
        .then((r) => r.json())
        .then((d) => { if (d.success) setUnreadCount(d.count); })
        .catch(() => {});
    };

    fetchCount();
    const interval = setInterval(fetchCount, 30000);
    return () => clearInterval(interval);
  }, [recipientId]);

  // Close popup on outside click
  useEffect(() => {
    const handler = (e) => {
      if (popupRef.current && !popupRef.current.contains(e.target)) {
        setShowPopup(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const go = (path) => { setShowPopup(false); navigate(path); };

  const handleUploadClick = () => {
    if (!user) { navigate("/login"); return; }
    setShowPopup((p) => !p);
  };

  const handleBellClick = () => setUnreadCount(0);

  return {
    showPopup,
    unreadCount,
    popupRef,
    user,
    role,
    go,
    handleUploadClick,
    handleBellClick,
  };
}