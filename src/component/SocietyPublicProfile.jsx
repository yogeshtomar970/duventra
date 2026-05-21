import API_BASE_URL from "../config/api.js";
import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

import Navbar from "./Navbar";
import BottomNav from "./BottomNav";
import ProfileCard from "./ProfileCard";
import CommitteeCard from "./CommitteeCard";
import SocietyMemberCard from "./SocietyMemberCard";
import SearchHeader from "./SearchHeader";
import PostNewsTab from "./PostNewsTab";

// Exact same CSS imports as ProfilePage.jsx
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

  const [socMemberSearch, setSocMemberSearch] = useState("");
  const [socMemberSearchOpen, setSocMemberSearchOpen] = useState(false);
  const [stuMemberSearch, setStuMemberSearch] = useState("");
  const [stuMemberSearchOpen, setStuMemberSearchOpen] = useState(false);
  const [followingSearch, setFollowingSearch] = useState("");
  const [followingSearchOpen, setFollowingSearchOpen] = useState(false);
  const [stuFollowSearch, setStuFollowSearch] = useState("");
  const [stuFollowSearchOpen, setStuFollowSearchOpen] = useState(false);

  const getMyId = () => {
    const user = JSON.parse(localStorage.getItem("user"));
    return user?.societyId || (user?.id ? "student_" + user.id : null);
  };

  useEffect(() => {
    if (!societyId) return;

    fetch(`${API_BASE_URL}/api/society/public/${societyId}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setSociety(d.data);
        setLoading(false);
      })
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
      .then((d) => {
        if (d.success) setMembers(d.data);
      })
      .catch(() => {});

    fetch(`${API_BASE_URL}/api/join/following/${societyId}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setFollowing(d.data);
      })
      .catch(() => {});

    fetch(`${API_BASE_URL}/api/student/following/${societyId}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setStudentFollowing(d.data);
      })
      .catch(() => {});

    fetch(`${API_BASE_URL}/api/post/all`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success)
          setPosts(d.posts.filter((p) => p.societyId === societyId));
      })
      .catch(() => {});
  }, [societyId]);

  useEffect(() => {
    if (!society?._id) return;
    fetch(`${API_BASE_URL}/api/news/all`)
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d))
          setNews(
            d.filter(
              (item) => item.userId?.toString() === society._id?.toString(),
            ),
          );
      })
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
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ myId, targetId: societyId, memberType }),
      });
      const data = await res.json();
      if (isFollowing) setIsFollowing(false);
      else if (data.joined) setIsFollowing(true);
    } catch (e) {}
    setJoinLoading(false);
  };

  const filterBy = (list, key, q) =>
    list.filter((i) => i[key]?.toLowerCase().includes(q.toLowerCase()));

  if (loading)
    return (
      <div className="pp-loading">
        <h3>Loading...</h3>
      </div>
    );
  if (!society)
    return (
      <div className="pp-loading">
        <h3>Society not found</h3>
      </div>
    );

  const myId = getMyId();
  const isOwnProfile = myId === society.societyId;

  const societyMembers = members.filter(
    (m) => !m.memberType || m.memberType === "society",
  );
  const studentMembers = members.filter((m) => m.memberType === "student");

  return (
    <>
      <Navbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <BottomNav />

      <div className="profile-container">
        {/* ── Profile Card — same component as ProfilePage ── */}
        <div style={{ position: "relative" }}>
          {/* ProfileCard renders with pc4-* classes, edit button hidden (onEditClick=null) */}
          <ProfileCard society={society} onEditClick={null} />

          {/* Join / Following button for non-own profiles */}
          {!isOwnProfile && (
            <button
              onClick={handleToggleJoin}
              disabled={joinLoading}
              className="pc4-edit-btn"
              style={{
                position: "absolute",
                bottom: "1.5rem",
                right: "2rem",
                width: "auto",
                padding: "10px 22px",
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

        {/* ── Committee Card — read-only (no edit button) ── */}
        {society.committee?.length > 0 && (
          <CommitteeCard committee={society.committee} onEditClick={null} />
        )}

        {/* ── Social Sections — same card style as ProfilePage ── */}
        <div
          className="pc4-card"
          style={{
            display: "flex",
            flexDirection: "column",
            padding: "1.5rem",
            gap: "1rem",
            gridTemplateColumns: "unset",
            marginBottom: 4,
          }}
        >
          {/* Society Members */}
          <SearchHeader
            title={`Society Members (${filterBy(societyMembers, "societyName", socMemberSearch).length})`}
            searchOpen={socMemberSearchOpen}
            onToggleSearch={setSocMemberSearchOpen}
            searchValue={socMemberSearch}
            onSearchChange={setSocMemberSearch}
            onClear={() => setSocMemberSearch("")}
          />
          <div className="horizontal-scroll">
            {filterBy(societyMembers, "societyName", socMemberSearch).length ===
            0 ? (
              <p style={{ color: "#999", fontSize: 13, margin: 0 }}>
                No society members yet
              </p>
            ) : (
              filterBy(societyMembers, "societyName", socMemberSearch).map(
                (item, i) => (
                  <SocietyMemberCard
                    key={i}
                    item={item}
                    isJoined={false}
                    onJoin={() => {}}
                    onCardClick={() =>
                      navigate(`/society-profile?id=${item.societyId}`)
                    }
                  />
                ),
              )
            )}
          </div>

          {/* Student Members */}
          <SearchHeader
            title={`Student Members (${filterBy(studentMembers, "name", stuMemberSearch).length})`}
            searchOpen={stuMemberSearchOpen}
            onToggleSearch={setStuMemberSearchOpen}
            searchValue={stuMemberSearch}
            onSearchChange={setStuMemberSearch}
            onClear={() => setStuMemberSearch("")}
          />
          <div className="horizontal-scroll">
            {filterBy(studentMembers, "name", stuMemberSearch).length === 0 ? (
              <p style={{ color: "#999", fontSize: 13, margin: 0 }}>
                No student members yet
              </p>
            ) : (
              filterBy(studentMembers, "name", stuMemberSearch).map(
                (item, i) => (
                  <SocietyMemberCard
                    key={i}
                    item={item}
                    isStudent={true}
                    isJoined={false}
                    onJoin={() => {}}
                    onCardClick={() =>
                      navigate(`/student-profile?id=${item.userId}`)
                    }
                  />
                ),
              )
            )}
          </div>

          {/* Society Following */}
          <SearchHeader
            title={`Society Following (${filterBy(following, "societyName", followingSearch).length})`}
            searchOpen={followingSearchOpen}
            onToggleSearch={setFollowingSearchOpen}
            searchValue={followingSearch}
            onSearchChange={setFollowingSearch}
            onClear={() => setFollowingSearch("")}
          />
          <div className="horizontal-scroll">
            {filterBy(following, "societyName", followingSearch).length ===
            0 ? (
              <p style={{ color: "#999", fontSize: 13, margin: 0 }}>
                No societies followed yet
              </p>
            ) : (
              filterBy(following, "societyName", followingSearch).map(
                (item, i) => (
                  <SocietyMemberCard
                    key={i}
                    item={item}
                    isJoined={false}
                    onJoin={() => {}}
                    onCardClick={() =>
                      navigate(`/society-profile?id=${item.societyId}`)
                    }
                  />
                ),
              )
            )}
          </div>

          {/* Student Following */}
          <SearchHeader
            title={`Student Following (${filterBy(studentFollowing, "name", stuFollowSearch).length})`}
            searchOpen={stuFollowSearchOpen}
            onToggleSearch={setStuFollowSearchOpen}
            searchValue={stuFollowSearch}
            onSearchChange={setStuFollowSearch}
            onClear={() => setStuFollowSearch("")}
          />
          <div className="horizontal-scroll">
            {filterBy(studentFollowing, "name", stuFollowSearch).length ===
            0 ? (
              <p style={{ color: "#999", fontSize: 13, margin: 0 }}>
                No students followed yet
              </p>
            ) : (
              filterBy(studentFollowing, "name", stuFollowSearch).map(
                (item, i) => (
                  <SocietyMemberCard
                    key={i}
                    item={item}
                    isStudent={true}
                    isJoined={false}
                    onJoin={() => {}}
                    onCardClick={() =>
                      navigate(`/student-profile?id=${item.userId}`)
                    }
                  />
                ),
              )
            )}
          </div>
        </div>

        {/* ── Posts & News — exact same PostNewsTab as ProfilePage ── */}
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
