import React, { useState } from "react";
import BottomNav from "./BottomNav";

// Styles
import "../styles/HelpSupport.css";

// Static data
import { faqs, contactOptions } from "../helpData.js";

// Components
import HsHeader      from "../component/HsHeader";
import QuickLinks    from "../component/QuickLinks";
import FeedbackForm  from "../component/FeedbackForm";
import ContactSection from "../component/ContactSection";
import AppInfo       from "../component/AppInfo";

// Hook
import useFeedback from "../hooks/useFeedback";

export default function HelpSupport() {
  const [activeCategory, setActiveCategory] = useState(null);

  const {
    feedback, setFeedback,
    feedbackType, setFeedbackType,
    feedbackSent,
    feedbackLoading,
    feedbackError,
    handleFeedbackSubmit,
  } = useFeedback();

  return (
    <div className="hs-page">
      <HsHeader />

      <div className="hs-content">

        

        

        <FeedbackForm
          feedback={feedback}
          setFeedback={setFeedback}
          feedbackType={feedbackType}
          setFeedbackType={setFeedbackType}
          feedbackSent={feedbackSent}
          feedbackLoading={feedbackLoading}
          feedbackError={feedbackError}
          onSubmit={handleFeedbackSubmit}
        />

        <ContactSection contactOptions={contactOptions} />

        <AppInfo />

      </div>

      <BottomNav />
    </div>
  );
}
