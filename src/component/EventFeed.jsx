import React from "react";
import EventCard from "./EventCard";
import useEventFeed from "../hooks/useEventFeed.js";
import FeedLoader from "./FeedLoader.jsx";
import FeedState from "./FeedState.jsx";
import "../styles/EventFeed.css";

export default function EventFeed({ filters, scrollToPostId }) {
  const {
    filteredPosts,
    loading,
    initialLoading,  // ← added
    error,
    highlightId,
    getProfileImg,
    getPosterImg,
    isUpcoming,
    lastPostRef,     // ← added
    hasMore,         // ← added
  } = useEventFeed({ filters, scrollToPostId });

  if (initialLoading) return <FeedLoader />;  // ← loading → initialLoading
  if (error)          return <FeedState message={error} isError />;
  if (filteredPosts.length === 0) return <FeedState message="No posts found." />;

  return (
    <div className="event-feed">
      {filteredPosts.map((post, index) => {  // ← index add kiya
        const isLast = index === filteredPosts.length - 1;  // ← last post check
        return (
          <EventCard
            key={post._id}
            ref={isLast ? lastPostRef : null}  // ← last card ko ref do
            postElementId={`post-${post._id}`}
            highlighted={highlightId === String(post._id)}
            profileimg={getProfileImg(post)}
            societyname={post.societyName}
            collegename={post.collegeName}
            societyId={post.societyId}
            type={post.societyType}
            posterimg={getPosterImg(post)}
            time={post.createdAt}
            description={post.description}
            formLink={post.formLink}
            views={post.views}
            postId={post._id}
            upcoming={isUpcoming(post)}
            lastDate={post.lastDate}
          />
        );
      })}

      {/* Scroll ke neeche loader aur end message */}
      {loading && <FeedLoader />}
      {!hasMore && (
        <p style={{ textAlign: "center", color: "gray", padding: "1rem" }}>
         Seen all the posts! 🎉
        </p>
      )}
    </div>
  );
}