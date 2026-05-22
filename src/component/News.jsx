import React from "react";
import { FaNewspaper } from "react-icons/fa";
import BottomNav from "../component/BottomNav";
import "../styles/NewsPage.css";

// Components
import NewsFilterBar  from "../component/NewsFilterBar";
import NewsFeedState  from "../component/NewsFeedState";
import NewsCard       from "../component/NewsCard";

// Hook
import useNewsFeed from "../hooks/useNewsFeed";

export default function NewsPage() {
  const {
    filtered, filter, setFilter,
    loading, initialLoading, error, load,  // ← initialLoading add
    highlightId, handleDelete,
    lastNewsRef, hasMore,                  // ← ye do add
  } = useNewsFeed();

  return (
    <div className="news-page">
      <div className="news-top-bar">
        <FaNewspaper className="news-top-icon" />
        <span className="news-top-title">Campus News</span>
      </div>

      <NewsFilterBar filter={filter} setFilter={setFilter} />

      <div className="news-feed">
        <NewsFeedState
          loading={initialLoading}   // ← loading → initialLoading
          error={error}
          empty={!initialLoading && !error && filtered.length === 0}
          onRetry={load}
        />
        {!initialLoading && !error && filtered.map((item, index) => {
          const isLast = index === filtered.length - 1;
          return (
            <NewsCard
              key={item._id}
              ref={isLast ? lastNewsRef : null}   // ← last card ko ref
              data={item}
              onDelete={handleDelete}
              highlighted={highlightId === String(item._id)}
            />
          );
        })}

        {loading && !initialLoading && <NewsFeedState loading />}
        {!hasMore && !initialLoading && (
          <p style={{ textAlign: "center", color: "gray", padding: "1rem" }}>
            Seen all the News! 🎉
          </p>
        )}
      </div>

      <BottomNav />
    </div>
  );
}