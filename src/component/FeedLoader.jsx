import React from "react";
import "../styles/FeedLoader.css";

function SkeletonCard({ delay = 0 }) {
  return (
    <div className="skeleton-card" style={{ animationDelay: `${delay}s` }}>
      <div className="skeleton-header">
        <div className="skeleton-line skeleton-avatar" />
        <div className="skeleton-title-wrap">
          <div className="skeleton-line skeleton-name" />
          <div className="skeleton-line skeleton-sub" />
        </div>
      </div>
      <div className="skeleton-line skeleton-poster" style={{ animationDelay: `${delay + 0.05}s` }} />
      <div className="skeleton-line skeleton-text-1" style={{ animationDelay: `${delay + 0.08}s` }} />
      <div className="skeleton-line skeleton-text-2" style={{ animationDelay: `${delay + 0.10}s` }} />
      <div className="skeleton-line skeleton-text-3" style={{ animationDelay: `${delay + 0.12}s` }} />
    </div>
  );
}

export default function FeedLoader() {
  return (
    <div style={{ padding: "8px 0" }}>
      <SkeletonCard delay={0} />
      <SkeletonCard delay={0.1} />
      <SkeletonCard delay={0.2} />
    </div>
  );
}
