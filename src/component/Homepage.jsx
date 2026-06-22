import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "../component/Navbar";
import BottomNav from "../component/BottomNav";
import TopBar from "../component/TopBar";
import Sidebar from "../component/sidebar";
import EventFeed from "../component/EventFeed";
import FeedbackButton from "../component/FeedbackButton";
import "../Homepage.css";

function Homepage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const scrollToPostId = location.state?.scrollToPostId || null;
  const [filters, setFilters] = useState({
    search: "",
    eventTypes: [],
    college: null,
    upcoming: false,
  });

  // Prevent body scroll when sidebar is open
  useEffect(() => {
    if (sidebarOpen) {
      document.body.classList.add("no-scroll");
    } else {
      document.body.classList.remove("no-scroll");
    }
  }, [sidebarOpen]);

  return (
    <div className="app-container">
      {/* Fixed top navbar */}
      <Navbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      {/* Fixed filter bar — sits just below navbar */}
      <TopBar
        onSearch={(text) =>
          setFilters((prev) => ({ ...prev, search: text }))
        }
        onFilterChange={(data) =>
          setFilters((prev) => ({
            ...prev,
            eventTypes: data.eventTypes || [],
            college: data.college || null,
            upcoming: data.upcoming || false,
          }))
        }
      />

      {/* Slide-in sidebar */}
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Main feed — EventFeed handles its own top-padding */}
      <main className="main-section">
        <EventFeed filters={filters} scrollToPostId={scrollToPostId} />
      </main>

      <BottomNav />
      <FeedbackButton />
    </div>
  );
}

export default Homepage;
