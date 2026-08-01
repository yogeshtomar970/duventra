import React, { useState } from "react";
import { FaMapMarkerAlt, FaRegClock } from "react-icons/fa";
import EventCard from "../component/EventCard";
import NewsCardWithActions from "../component/NewsCardWithActions";
import DotMenu from "./DotMenu";
import EditJobModal from "./EditJobModal";
import API_BASE_URL from "../config/api.js";
import "../styles/PostNewsTab.css";
import "../styles/PlacementCell.css";

const getImageUrl = (url, fallback) => {
  if (!url) return fallback;
  if (url.startsWith("http")) return url;
  return `${API_BASE_URL}${url}`;
};

const DEFAULT_AVATAR = "https://randomuser.me/api/portraits/men/1.jpg";

// ── Job card helpers — PlacementCell jaisa hi look yahan bhi ──
function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const d = Math.floor(diff / 86400000);
  if (d === 0) return "Today";
  if (d === 1) return "Yesterday";
  if (d < 30) return `${d} days ago`;
  return new Date(dateStr).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

const TYPE_COLORS = {
  "Full-time": "#4f46e5",
  "Part-time": "#0891b2",
  "Internship": "#059669",
  "Freelance": "#d97706",
  "Contract": "#dc2626",
};

function SocAvatar({ name = "", pic = "" }) {
  if (pic) return <img src={pic} alt={name} className="pc-avatar" />;
  const initials = name.split(" ").slice(0, 2).map(w => w[0]?.toUpperCase() || "").join("");
  const colors = ["#4f46e5", "#0891b2", "#059669", "#d97706", "#7c3aed"];
  const bg = colors[name.charCodeAt(0) % colors.length];
  return <div className="pc-avatar pc-avatar-fallback" style={{ background: bg }}>{initials}</div>;
}

export default function PostNewsTab({
  activeTab,
  setActiveTab,
  myPosts,
  myNews,
  myJobs,
  society,
  onEditPost,
  onDeletePost,
  onEditJob,
  onDeleteJob,
  onJobUpdated,
  onNewsUpdated,
  onNewsDeleted,
}) {
  const user = JSON.parse(localStorage.getItem("user"));
  const [openJobMenuId, setOpenJobMenuId] = useState(null);
  const [editingJob, setEditingJob] = useState(null);

  return (
    <div className="pnt-card">
      {/* ── Header with toggle ── */}
      <div className="pnt-header">
        <div className="pnt-toggle">
          <button
            className={`pnt-tog ${activeTab === "post" ? "pnt-tog--active" : ""}`}
            onClick={() => setActiveTab("post")}
          >
            Post
          </button>
          <button
            className={`pnt-tog ${activeTab === "news" ? "pnt-tog--active" : ""}`}
            onClick={() => setActiveTab("news")}
          >
            News
          </button>
          <button
            className={`pnt-tog ${activeTab === "jobs" ? "pnt-tog--active" : ""}`}
            onClick={() => setActiveTab("jobs")}
          >
            Jobs
          </button>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="pnt-body">
        {activeTab === "post" && (
          <div className="post-grid">
            {myPosts.length === 0 ? (
              <p className="pnt-empty">No posts uploaded yet</p>
            ) : (
              myPosts.map((post) => (
                <EventCard
                  key={post._id}
                  profileimg={getImageUrl(society?.profilePic, DEFAULT_AVATAR)}
                  societyname={society?.societyName}
                  collegename={society?.collegeName}
                  societyId={post.societyId}
                  type={society?.societyType}
                  posterimg={post.image}
                  time={post.createdAt}
                  description={post.description}
                  formLink={post.formLink}
                  views={post.views}
                  postId={post._id}
                  onEditPost={() => onEditPost(post)}
                  onDeletePost={() => onDeletePost(post)}
                />
              ))
            )}
          </div>
        )}

        {activeTab === "news" && (
          <div className="news-section">
            {myNews.length === 0 ? (
              <p className="pnt-empty">No news uploaded yet</p>
            ) : (
              myNews.map((item) => (
                <NewsCardWithActions
                  key={item._id}
                  item={item}
                  userId={user?.id}
                  onUpdated={onNewsUpdated}
                  onDeleted={onNewsDeleted}
                />
              ))
            )}
          </div>
        )}

        {activeTab === "jobs" && (
          <div className="job-section">
            {!myJobs || myJobs.length === 0 ? (
              <p className="pnt-empty">No jobs posted yet</p>
            ) : (
              myJobs.map((job) => {
                const typeColor = TYPE_COLORS[job.jobType] || "#4f46e5";
                return (
                  <div className="pc-job-card" key={job._id} style={{ cursor: "default" }}>
                    <div className="pc-job-card-header">
                      <SocAvatar name={job.societyName} pic={job.societyPic} />
                      <div className="pc-job-card-info">
                        <h3 className="pc-job-title">{job.title}</h3>
                        <span className="pc-job-society" style={{ color: typeColor }}>{job.societyName}</span>
                        <div className="pc-job-meta">
                          <span><FaMapMarkerAlt /> {job.location || "Delhi, India"}</span>
                          <span><FaRegClock /> {job.jobType}</span>
                        </div>
                        <p className="pc-job-date">Posted on {timeAgo(job.createdAt)}</p>
                      </div>
                      {(onDeleteJob || onEditJob) && (
                        <DotMenu
                          show={openJobMenuId === job._id}
                          setShow={(v) =>
                            setOpenJobMenuId((prev) => {
                              const next = typeof v === "function" ? v(prev === job._id) : v;
                              return next ? job._id : null;
                            })
                          }
                          editLabel="Edit Job"
                          deleteLabel="Delete Job"
                          onEdit={() => setEditingJob(job)}
                          onDelete={() => onDeleteJob(job._id)}
                        />
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* {activeTab === "jobs" && (
          <div className="job-section">
            {!myJobs || myJobs.length === 0 ? (
              <p className="pnt-empty">No jobs posted yet</p>
            ) : (
              myJobs.map((job) => (
                <div
                  key={job._id}
                  style={{
                    background: "#f9f9f9",
                    borderRadius: 12,
                    padding: "12px 14px",
                    marginBottom: 10,
                    border: "1px solid #eee",
                  }}
                >
                  <h4 style={{ margin: "0 0 4px", fontSize: 15 }}>
                    {job.title}
                  </h4>
                  <span
                    style={{ fontSize: 12, color: "#4f46e5", fontWeight: 600 }}
                  >
                    {job.jobType}
                  </span>
                  <p style={{ fontSize: 12, color: "#888", margin: "4px 0 0" }}>
                    {job.location}
                  </p>
                </div>
              ))
            )}
          </div>
        )}  */}
      </div>

      {editingJob && (
        <EditJobModal
          job={editingJob}
          onClose={() => setEditingJob(null)}
          onUpdated={(updatedJob) => {
            onJobUpdated?.(updatedJob);
            setEditingJob(null);
          }}
        />
      )}
    </div>
  );
}