import React from "react";
import "../styles/FeedbackHeader.css";

export default function FeedbackHeader({ onClose }) {
  return (
    <div className="feedback-header">
      <div className="feedback-header-left">
        <div className="feedback-header-icon">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </div>
        <div>
          <h3 className="feedback-title">Share Feedback</h3>
          <p className="feedback-subtitle">Help us improve Duventra</p>
        </div>
      </div>

      <button
        className="feedback-close"
        onClick={onClose}
        aria-label="Close"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  );
}
