import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API_BASE_URL from "../config/api.js";
import NewsCard from "./NewsCard.jsx";

export default function NewsByLink() {
  const { newsId } = useParams();
  const navigate = useNavigate();
  const [news, setNews] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!newsId) return;
    fetch(`${API_BASE_URL}/api/news/single/${newsId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setNews(data.news);
        else setError(true);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [newsId]);

  if (loading) {
    return (
      <div style={styles.center}>
        <div style={styles.spinner} />
        <p style={styles.loadingText}>News is loading...</p>
      </div>
    );
  }

  if (error || !news) {
    return (
      <div style={styles.center}>
        <p style={{ fontSize: 40 }}>😕</p>
        <p style={styles.errText}>The news was not found or has been deleted.</p>
        <button style={styles.btn} onClick={() => navigate("/news")}>
          Go to the news
        </button>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      {/* Top bar */}
      <div style={styles.topbar}>
        <button style={styles.backBtn} onClick={() => navigate("/news")}>
          ← News
        </button>
        <span style={styles.topTitle}>Shared News</span>
      </div>

      {/* The actual NewsCard */}
      <div style={styles.cardWrap}>
        <NewsCard data={news} />
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f4f4f8",
    paddingBottom: 40,
  },
  topbar: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "14px 16px",
    background: "#fff",
    boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
    position: "sticky",
    top: 0,
    zIndex: 10,
  },
  backBtn: {
    background: "none",
    border: "none",
    fontSize: 15,
    fontWeight: 600,
    color: "#6C63FF",
    cursor: "pointer",
    padding: "4px 0",
  },
  topTitle: {
    fontSize: 16,
    fontWeight: 700,
    color: "#1a1a2e",
  },
  cardWrap: {
    maxWidth: 480,
    margin: "20px auto",
    padding: "0 12px",
  },
  center: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    fontFamily: "sans-serif",
  },
  spinner: {
    width: 36,
    height: 36,
    border: "4px solid #e0e0e0",
    borderTop: "4px solid #6C63FF",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
  loadingText: { color: "#888", fontSize: 15 },
  errText: { color: "#555", fontSize: 16, fontWeight: 500 },
  btn: {
    padding: "10px 24px",
    background: "#6C63FF",
    color: "#fff",
    border: "none",
    borderRadius: 10,
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
  },
};
