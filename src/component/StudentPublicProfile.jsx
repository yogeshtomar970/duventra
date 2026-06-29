import API_BASE_URL from "../config/api.js";
import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

import Navbar from "./Navbar";
import BottomNav from "./BottomNav";
import StudentProfileCard from "./StudentProfileCard";
import SocietyConnectionsPanel from "./SocietyMemberCard";
import NewsCardWithActions from "./NewsCardWithActions";

import "../styles/Profile.css";
import "../styles/StudentProfileCard.css";
import "../styles/SocietyMemberCard.css";
import "../ProfilePage.css";
import FeedLoader from "./FeedLoader.jsx";

const getImageUrl = (url, fallback) => {
  if (!url) return fallback;
  if (url.startsWith("http")) return url;
  return `${API_BASE_URL}${url}`;
};

const DEFAULT_AVATAR = "https://randomuser.me/api/portraits/men/1.jpg";

export default function StudentPublicProfile() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const studentUserId = searchParams.get("id");

  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [societyMembers, setSocietyMembers] = useState([]);
  const [studentMembers, setStudentMembers] = useState([]);
  const [societyFollowing, setSocietyFollowing] = useState([]);
  const [studentFollowing, setStudentFollowing] = useState([]);
  const [news, setNews] = useState([]);

  const getLoggedInUser = () => JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    if (!studentUserId) return;
    fetch(`${API_BASE_URL}/api/student/public/${studentUserId}`)
      .then((r) => r.json())
      .then((d) => { if (d.success) setStudent(d.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [studentUserId]);

  useEffect(() => {
    if (!student) return;
    const studentMongoId = student._id;
    const me = getLoggedInUser();

    if (me) {
      const myFollowerId = me.societyId || me.id;
      fetch(`${API_BASE_URL}/api/student/check-follow/${myFollowerId}/${studentMongoId}`)
        .then((r) => r.json())
        .then((d) => setIsFollowing(d.followed))
        .catch(() => {});
    }

    fetch(`${API_BASE_URL}/api/student/members/${studentMongoId}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setSocietyMembers(d.data.filter((m) => m.memberType === "society"));
          setStudentMembers(d.data.filter((m) => m.memberType === "student" || !m.memberType));
        }
      })
      .catch(() => {});

    const socId = "student_" + student._id;
    fetch(`${API_BASE_URL}/api/join/following/${socId}`)
      .then((r) => r.json())
      .then((d) => { if (d.success) setSocietyFollowing(d.data); })
      .catch(() => {});

    fetch(`${API_BASE_URL}/api/student/following/${studentMongoId}`)
      .then((r) => r.json())
      .then((d) => { if (d.success) setStudentFollowing(d.data); })
      .catch(() => {});

    fetch(`${API_BASE_URL}/api/news/user/${studentMongoId}`)
      .then((r) => r.json())
      .then((d) => setNews(Array.isArray(d.news) ? d.news : []))
      .catch(() => {});
  }, [student]);

  const handleToggleFollow = async () => {
    const me = getLoggedInUser();
    if (!me) return alert("Please login first");
    if (!student?._id) return;
    const isSociety = !!me.societyId;
    const myId = isSociety ? me.societyId : me.id;
    const followerType = isSociety ? "society" : "student";
    if (!isSociety && me.id === student._id?.toString()) return;
    const token = localStorage.getItem("token");
    setFollowLoading(true);
    try {
      const endpoint = isFollowing ? "/api/student/unfollow" : "/api/student/follow";
      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ myId, targetId: student._id.toString(), followerType }),
      });
      const data = await res.json();
      if (isFollowing) { if (data.followed === false) setIsFollowing(false); }
      else { if (data.followed) setIsFollowing(true); }
    } catch (e) {}
    setFollowLoading(false);
  };

  if (loading) return <FeedLoader/>;

  if (!student) return <div className="pp-loading"><h3>Student not found</h3></div>;

  const me = getLoggedInUser();
  const isOwnProfile = me?.id === student._id?.toString();

  // Public profile — read-only panel (no join actions)
  const SECTIONS_DATA = {
    "soc-members":   societyMembers,
    "stu-members":   studentMembers,
    "soc-following": societyFollowing,
    "stu-following": studentFollowing,
    "soc-suggest":   [],
    "stu-suggest":   [],
  };

  return (
    <>
      <Navbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <BottomNav />

      <div className="student-container">
        <div style={{ position: "relative" }}>
          <StudentProfileCard
            student={student}
            getImageUrl={getImageUrl}
            defaultAvatar={DEFAULT_AVATAR}
            onEditClick={null}
          />
          {!isOwnProfile && (
            <button
              onClick={handleToggleFollow}
              disabled={followLoading}
              className="sp-edit-btn"
              style={{
                position: "absolute", bottom: "1.5rem", right: "2rem",
                width: "auto", padding: "10px 22px",
                background: isFollowing ? "#f0e8df" : "#b5651d",
                color: isFollowing ? "#8b5e3c" : "#fff",
                border: isFollowing ? "1px solid #d6c5b0" : "none",
                opacity: followLoading ? 0.6 : 1,
              }}
            >
              {isFollowing ? "Following ✓" : "Follow"}
            </button>
          )}
        </div>

        {/* ── Connections Panel ── */}
        <SocietyConnectionsPanel
          members={societyMembers}
          studentMembers={studentMembers}
          following={societyFollowing}
          studentFollowing={studentFollowing}
          suggestions={[]}
          studentSuggestions={[]}
          isJoinedSociety={(item) => societyFollowing.some((f) => f.societyId === item.societyId)}
          isJoinedStudent={(item) => studentFollowing.some((f) => f._id === item._id)}
          onJoinSociety={async (item) => {
            const me = getLoggedInUser();
            const myId = me?.societyId || me?.id;
            const token = localStorage.getItem("token");
            const isJoined = societyFollowing.some((f) => f.societyId === item.societyId);
            const endpoint = isJoined ? "/api/join/unjoin" : "/api/join/join";
            const res = await fetch(`${API_BASE_URL}${endpoint}`, {
              method: "POST",
              headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
              body: JSON.stringify({ myId, targetId: item.societyId }),
            });
            const data = await res.json();
            if (isJoined && !data.joined) setSocietyFollowing((p) => p.filter((f) => f.societyId !== item.societyId));
            else if (data.joined) setSocietyFollowing((p) => [...p, item]);
          }}
          onJoinStudent={async (item) => {
            const me = getLoggedInUser();
            const myId = me?.societyId || me?.id;
            const followerType = me?.societyId ? "society" : "student";
            const token = localStorage.getItem("token");
            const isJoined = studentFollowing.some((f) => f._id === item._id);
            const endpoint = isJoined ? "/api/student/unfollow" : "/api/student/follow";
            const res = await fetch(`${API_BASE_URL}${endpoint}`, {
              method: "POST",
              headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
              body: JSON.stringify({ myId, targetId: item._id.toString(), followerType }),
            });
            const data = await res.json();
            if (isJoined && data.followed === false) setStudentFollowing((p) => p.filter((f) => f._id !== item._id));
            else if (data.followed) setStudentFollowing((p) => [...p, item]);
          }}
          onSocietyClick={(item) => navigate(`/society-profile?id=${item.societyId}`)}
          onStudentClick={(item) => navigate(`/student-profile?id=${item.userId}`)}
          readOnly={false}
        />

        {/* ── News ── */}
        {news.length > 0 && (
          <div className="sp-card" style={{ display:"flex", flexDirection:"column", padding:"1.5rem", gap:"1rem", marginTop:8 }}>
            <p style={{ fontFamily:"'Fraunces',serif", fontSize:18, fontWeight:700, color:"#b5651d", margin:0 }}>News</p>
            <div style={{ height:1, background:"rgba(0,0,0,0.07)" }} />
            {news.map((item) => (
              <NewsCardWithActions key={item._id} item={item} userId={me?.id} onUpdated={null} onDeleted={null} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
