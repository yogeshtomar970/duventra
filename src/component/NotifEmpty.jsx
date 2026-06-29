import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell, faSpinner } from "@fortawesome/free-solid-svg-icons";
import { TYPE_CONFIG } from "../notificationHelpers.js";
import FeedLoader from "./FeedLoader.jsx";

/**
 * NotifEmpty
 * Shows loading spinner or empty state depending on props.
 */
export default function NotifEmpty({ loading, activeTab }) {
if (loading) return <FeedLoader />;


  return (
    <div className="notif-empty">
      <FontAwesomeIcon icon={faBell} size="3x" style={{ opacity: 0.15 }} />
      <p>No {activeTab !== "all" ? activeTab : ""} notifications yet</p>
      <span className="notif-empty-sub">
        {activeTab === "all"
          ? "When someone likes or comments on your post, it will appear here."
          : `No ${TYPE_CONFIG[activeTab]?.label?.toLowerCase()} notifications`}
      </span>
    </div>
  );
}
