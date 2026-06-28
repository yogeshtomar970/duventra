import API_BASE_URL from "../config/api.js";
import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

import Navbar from "./Navbar";
import BottomNav from "./BottomNav";
import ProfileCard from "./ProfileCard";
import CommitteeCard from "./CommitteeCard";
import SocietyConnectionsPanel from "./SocietyMemberCard";
import PostNewsTab from "./PostNewsTab";

import "../ProfilePage.css";
import "../styles/ProfileCard.css";
import "../styles/CommitteeCard.css";
import "../styles/SocietyMemberCard.css";
import "../styles/PostNewsTab.css";

const getImageUrl = (url, fallback) => {
  if (!url) return fallback;
  if (url.startsWith("http")) return url;
  return `${API_BASE_URL}${url}`;
};

export default function SocietyPublicProfile() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const societyId = searchParams.get("id");

  const [society, setSociety] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [joinLoading, setJoinLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("post");

  const [posts, setPosts] = useState([]);
  const [news, setNews] = useState([]);
  const [members, setMembers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [studentFollowing, setStudentFollowing] = useState([]);

  const getMyId = () => {
    const user = JSON.parse(localStorage.getItem("user"));
    return user?.societyId || (user?.id ? "student_" + user.id : null);
  };

  useEffect(() => {
    if (!societyId) return;

    fetch(`${API_BASE_URL}/api/society/public/${societyId}`)
      .then((r) => r.json())
      .then((d) => { if (d.success) setSociety(d.data); setLoading(false); })
      .catch(() => setLoading(false));

    const myId = getMyId();
    if (myId) {
      fetch(`${API_BASE_URL}/api/join/check/${myId}/${societyId}`)
        .then((r) => r.json())
        .then((d) => setIsFollowing(d.joined))
        .catch(() => {});
    }

    fetch(`${API_BASE_URL}/api/join/members/${societyId}`)
      .then((r) => r.json())
      .then((d) => { if (d.success) setMembers(d.data); })
      .catch(() => {});

    fetch(`${API_BASE_URL}/api/join/following/${societyId}`)
      .then((r) => r.json())
      .then((d) => { if (d.success) setFollowing(d.data); })
      .catch(() => {});

    fetch(`${API_BASE_URL}/api/student/following/${societyId}`)
      .then((r) => r.json())
      .then((d) => { if (d.success) setStudentFollowing(d.data); })
      .catch(() => {});

    fetch(`${API_BASE_URL}/api/post/all`)
      .then((r) => r.json())
      .then((d) => { if (d.success) setPosts(d.posts.filter((p) => p.societyId === societyId)); })
      .catch(() => {});
  }, [societyId]);

  useEffect(() => {
    if (!society?._id) return;
    fetch(`${API_BASE_URL}/api/news/user/${society._id}`)
      .then((r) => r.json())
      .then((d) => setNews(Array.isArray(d.news) ? d.news : []))
      .catch(() => {});
  }, [society]);

  const handleToggleJoin = async () => {
    const myId = getMyId();
    if (!myId) return alert("Please login first");
    if (myId === societyId) return;
    setJoinLoading(true);
    const token = localStorage.getItem("token");
    try {
      const endpoint = isFollowing ? "/api/join/unjoin" : "/api/join/join";
      const user = JSON.parse(localStorage.getItem("user"));
      const memberType = user?.societyId ? "society" : "student";
      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ myId, targetId: societyId, memberType }),
      });
      const data = await res.json();
      if (isFollowing) setIsFollowing(false);
      else if (data.joined) setIsFollowing(true);
    } catch (e) {}
    setJoinLoading(false);
  };

  if (loading) return <div className="pp-loading"><h3>Loading...</h3></div>;
  if (!society) return <div className="pp-loading"><h3>Society not found</h3></div>;

  const myId = getMyId();
  const isOwnProfile = myId === society.societyId;
  const societyMembers = members.filter((m) => !m.memberType || m.memberType === "society");
  const studentMembers = members.filter((m) => m.memberType === "student");

  return (
    <>
      <Navbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <BottomNav />

      <div className="profile-container">
        <div style={{ position: "relative" }}>
          <ProfileCard society={society} onEditClick={null} />
          {!isOwnProfile && (
            <button
              onClick={handleToggleJoin}
              disabled={joinLoading}
              className="pc4-edit-btn"
              style={{
                position: "absolute", bottom: "1.5rem", right: "2rem",
                width: "auto", padding: "10px 22px",
                background: isFollowing ? "#f0e8df" : "#b5651d",
                color: isFollowing ? "#8b5e3c" : "#fff",
                border: isFollowing ? "1px solid #d6c5b0" : "none",
                opacity: joinLoading ? 0.6 : 1,
              }}
            >
              {isFollowing ? "Joined ✓" : "Join Us"}
            </button>
          )}
        </div>

        {/* ── Committee Card — read-only ── */}
        {society.committee?.length > 0 && (
          <CommitteeCard committee={society.committee} onEditClick={null} />
        )}

        {/* ── Connections Panel ── */}
        <SocietyConnectionsPanel
          members={societyMembers}
          studentMembers={studentMembers}
          following={following}
          studentFollowing={studentFollowing}
          suggestions={[]}
          studentSuggestions={[]}
          isJoinedSociety={() => false}
          isJoinedStudent={() => false}
          onJoinSociety={() => {}}
          onJoinStudent={() => {}}
          onSocietyClick={(item) => navigate(`/society-profile?id=${item.societyId}`)}
          onStudentClick={(item) => navigate(`/student-profile?id=${item.userId}`)}
          readOnly={true}
        />

        {/* ── Posts & News ── */}
        <PostNewsTab
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          myPosts={posts}
          myNews={news}
          society={society}
          onEditPost={null}
          onDeletePost={null}
          onNewsUpdated={null}
          onNewsDeleted={null}
        />
      </div>
    </>
  );
}
