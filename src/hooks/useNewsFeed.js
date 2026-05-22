import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation } from "react-router-dom";
import API_BASE_URL from "../config/api.js";

export default function useNewsFeed() {
  const [newsList,      setNewsList]      = useState([]);
  const [filter,        setFilter]        = useState("all");
  const [loading,       setLoading]       = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error,         setError]         = useState(null);
  const [highlightId,   setHighlightId]   = useState(null);
  const [page,          setPage]          = useState(1);
  const [hasMore,       setHasMore]       = useState(true);
  const observerRef = useRef(null);
  const LIMIT = 10;

  const location = useLocation();

  const fetchNews = useCallback(async (pageNum) => {
    if (loading || !hasMore) return;
    setLoading(true);
    setError(null);
    try {
      const res  = await fetch(`${API_BASE_URL}/api/news/all?page=${pageNum}&limit=${LIMIT}`);
      const data = await res.json();
      const list = Array.isArray(data.news) ? data.news : [];
      setNewsList(prev => pageNum === 1 ? list : [...prev, ...list]);
      setHasMore(data.hasMore ?? false);
    } catch {
      setError("Failed to load news. Check your connection.");
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  }, [loading, hasMore]);

  // Pehli baar load
  useEffect(() => { fetchNews(1); }, []);

  // Scroll to news from notification
  useEffect(() => {
    const targetId = location.state?.scrollToNewsId;
    if (!targetId) return;
    setHighlightId(String(targetId));
    const doScroll = () => {
      const el = document.getElementById(`news-${targetId}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        setTimeout(() => setHighlightId(null), 3000);
      } else {
        setTimeout(doScroll, 200);
      }
    };
    const timer = setTimeout(doScroll, 400);
    return () => clearTimeout(timer);
  }, [location.state?.scrollToNewsId]);

  // Last card observer
  const lastNewsRef = useCallback((node) => {
    if (loading) return;
    if (observerRef.current) observerRef.current.disconnect();
    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        const next = page + 1;
        setPage(next);
        fetchNews(next);
      }
    });
    if (node) observerRef.current.observe(node);
  }, [loading, hasMore, page, fetchNews]);

  const filtered = newsList.filter((item) => {
    if (filter === "all") return true;
    const d = new Date(item.createdAt);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    if (filter === "today")     return d.toDateString() === today.toDateString();
    if (filter === "yesterday") return d.toDateString() === yesterday.toDateString();
    return true;
  });

  const handleDelete = (id) =>
    setNewsList(prev => prev.filter(n => n._id !== id));

  return {
    newsList, filtered, filter, setFilter,
    loading, initialLoading, error, load: () => fetchNews(1),
    highlightId, handleDelete,
    lastNewsRef, hasMore,
  };
}