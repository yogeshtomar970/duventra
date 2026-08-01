import React, { useState } from "react";
import EventCard from "../component/EventCard";
import NewsCardWithActions from "../component/NewsCardWithActions";
import DotMenu from "./DotMenu";
import EditJobModal from "./EditJobModal";
import API_BASE_URL from "../config/api.js";
import "../styles/PostNewsTab.css";

const getImageUrl = (url, fallback) => {
  if (!url) return fallback;
  if (url.startsWith("http")) return url;
  return `${API_BASE_URL}${url}`;
};

const DEFAULT_AVATAR = "https://randomuser.me/api/portraits/men/1.jpg";

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
              myJobs.map((job) => (
                <article key={job._id} className="nc-cards">
                  <div className="nc-card-header">
                    <div className="nc-author-row">
                      <div className="nc-author-avatar nc-avatar-fallback">
                        {(job.societyName || "S")[0].toUpperCase()}
                      </div>
                      <div className="nc-author-info">
                        <span className="nc-author-name">{job.title}</span>
                        <span
                          className="nc-author-role"
                          style={{ color: "#4f46e5" }}
                        >
                          {job.jobType}
                        </span>
                      </div>
                    </div>
                    {(onDeleteJob || onEditJob) && (
                      <div className="nc-header-right">
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
                      </div>
                    )}
                  </div>
                  <div className="nc-desc-wrap">
                    <p className="nc-card-desc">{job.description}</p>
                    <p
                      className="nc-card-desc"
                      style={{ color: "#888", fontSize: 12 }}
                    >
                      📍 {job.location}
                    </p>
                  </div>
                </article>
              ))
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