import { useState, useEffect, useRef, useCallback } from "react";
import API_BASE_URL from "../config/api.js";

export default function useEventFeed({ filters, scrollToPostId }) {
  const [posts, setPosts]               = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [loading, setLoading]           = useState(false);
  const [initialLoading, setInitialLoading] = useState(true); // pehli baar ka loader
  const [error, setError]               = useState(null);
  const [highlightId, setHighlightId]   = useState(null);
  const [page, setPage]                 = useState(1);
  const [hasMore, setHasMore]           = useState(true);
  const observerRef = useRef(null);     // last post element ko observe karega
  const LIMIT = 10;

  // ── Fetch posts (page-wise) ───────────────────────────
  const fetchPosts = useCallback(async (pageNum) => {
    if (loading || !hasMore) return;
    setLoading(true);
    try {
      const upcomingParam = filters?.upcoming ? "&upcoming=true" : "";
      const res  = await fetch(`${API_BASE_URL}/api/post/all?page=${pageNum}&limit=${LIMIT}${upcomingParam}`);
      const data = await res.json();
      const newPosts = data.posts || [];

      setPosts(prev => pageNum === 1 ? newPosts : [...prev, ...newPosts]);
      setHasMore(data.hasMore);
    } catch {
      setError("Failed to load posts");
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  }, [loading, hasMore, filters?.upcoming]);

  // ── Pehli baar load + jab "upcoming" filter toggle ho dobara fetch karo ──
  useEffect(() => {
    setPosts([]);
    setPage(1);
    setHasMore(true);
    setInitialLoading(true);
    fetchPosts(1);
  }, [filters?.upcoming]);

  // ── Filter apply karo ─────────────────────────────────
  useEffect(() => {
    if (!filters) { setFilteredPosts(posts); return; }
    let updated = [...posts];
    if (filters.search) {
      const q = filters.search.toLowerCase();
      updated = updated.filter(p =>
        p.description?.toLowerCase().includes(q) ||
        p.societyName?.toLowerCase().includes(q)
      );
    }
    if (filters.eventTypes?.length > 0) {
      updated = updated.filter(p =>
        p.eventTypes?.some(t => filters.eventTypes.includes(t))
      );
    }
    if (filters.college) {
      updated = updated.filter(p =>
        p.collegeName?.toLowerCase().trim() === filters.college?.toLowerCase().trim()
      );
    }
    setFilteredPosts(updated);
  }, [filters, posts]);

  // ── Infinite Scroll: last post observe karo ───────────
  const lastPostRef = useCallback((node) => {
    if (loading) return;
    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchPosts(nextPage);
      }
    });

    if (node) observerRef.current.observe(node);
  }, [loading, hasMore, page, fetchPosts]);

  // ── Scroll to post ────────────────────────────────────
  useEffect(() => {
    if (!scrollToPostId) return;
    setHighlightId(String(scrollToPostId));
    const doScroll = () => {
      const el = document.getElementById(`post-${scrollToPostId}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        setTimeout(() => setHighlightId(null), 3000);
      } else {
        setTimeout(doScroll, 200);
      }
    };
    const timer = setTimeout(doScroll, 400);
    return () => clearTimeout(timer);
  }, [scrollToPostId]);

  const getProfileImg = (post) => {
    if (post.profilePic) {
      const url = post.profilePic.startsWith("http")
        ? post.profilePic
        : `${API_BASE_URL}${post.profilePic}`;
      // Avatar chhota hai, isliye aur bhi zyada compress kar sakte hain
      if (url.includes("res.cloudinary.com")) {
        return url.replace("/upload/", "/upload/f_auto,q_auto,w_100,h_100,c_fill/");
      }
      return url;
    }
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(post.societyName || "S")}&background=0e132f&color=fff`;
  };

  const getPosterImg = (post) => {
    if (!post.image) return null;
    if (!post.image.startsWith("http")) return `${API_BASE_URL}${post.image}`;
    // Cloudinary URL hai → auto-compress + resize karo (feed mein full-res nahi chahiye)
    // f_auto = best format (webp/avif), q_auto = auto quality, w_800 = max width
    if (post.image.includes("res.cloudinary.com")) {
      return post.image.replace("/upload/", "/upload/f_auto,q_auto,w_800/");
    }
    return post.image;
  };

  // Event abhi "Upcoming" hai ya nahi — lastDate abhi tak nahi aayi
  const isUpcoming = (post) => {
    if (!post.lastDate) return false;
    return new Date(post.lastDate) >= new Date();
  };

  return {
    filteredPosts,
    loading,
    initialLoading, // ← ye bhi return karo
    error,
    highlightId,
    getProfileImg,
    getPosterImg,
    isUpcoming,
    lastPostRef,    // ← ye bhi return karo
    hasMore,
  };
}