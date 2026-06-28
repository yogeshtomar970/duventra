import API_BASE_URL from "../config/api.js";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import "../styles/Profile.css";

// Layout
import Navbar from "../component/Navbar";
import BottomNav from "../component/BottomNav";
import Sidebar from "../component/sidebar";

// Feature components
import StudentProfileCard from "../component/StudentProfileCard";
import EditStudentProfileModal from "../component/EditStudentProfileModal";
import SocietyConnectionsPanel from "../component/SocietyMemberCard";
import StudentNewsSection from "../component/StudentNewsSection";

// Hooks
import useStudentData from "../hooks/useStudentData";
import useStudentNetwork from "../hooks/useStudentNetwork";
import useEditStudentProfile from "../hooks/useEditStudentProfile";

// Constants
const DEFAULT_AVATAR =
  "https://www.stryx.com/cdn/shop/articles/man-looking-attractive.jpg?v=1666662774";

const getImageUrl = (url, fallback) => {
  if (!url) return fallback;
  if (url.startsWith("http")) return url;
  return `${API_BASE_URL}${url}`;
};

export default function Studentprofile() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    document.body.classList.toggle("no-scroll", sidebarOpen);
    return () => document.body.classList.remove("no-scroll");
  }, [sidebarOpen]);

  // ── Hooks ──
  const { student, setStudent, loading, notLoggedIn, myNews, setMyNews, getUserId } =
    useStudentData();

  const {
    societyMembers, societyFollowing,
    societySuggestions,
    studentMembers, studentFollowing,
    studentSuggestions,
    handleJoinSocietyFromSuggestion, handleToggleSocietyFollowing,
    handleToggleSocietyMemberFollow, handleJoinStudentFromSuggestion,
    handleToggleStudentFollowing, handleToggleStudentMemberFollow,
  } = useStudentNetwork();

  const {
    showModal, previewUrl, editCollege, setEditCollege, editYear, setEditYear,
    openModal, closeModal, handleImageChange, handleSaveProfile,
  } = useEditStudentProfile({ setStudent });

  // ── Early returns ──
  if (loading)
    return <div style={{ textAlign: "center", padding: "60px 20px" }}><h3>Loading profile...</h3></div>;
  if (notLoggedIn)
    return <div style={{ textAlign: "center", padding: "60px 20px" }}><h3>Please login to view your profile</h3></div>;
  if (!student)
    return <div style={{ textAlign: "center", padding: "60px 20px" }}><h3>Student profile not found</h3></div>;

  return (
    <>
      <Navbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <BottomNav />

      <div className="student-container">

        {/* ── Profile Card ── */}
        <StudentProfileCard
          student={student}
          getImageUrl={getImageUrl}
          defaultAvatar={DEFAULT_AVATAR}
          onEditClick={() => openModal(student)}
        />

        {/* ── Connections Panel — same as Society profile ── */}
        <SocietyConnectionsPanel
          members={societyMembers}
          studentMembers={studentMembers}
          following={societyFollowing}
          studentFollowing={studentFollowing}
          suggestions={societySuggestions}
          studentSuggestions={studentSuggestions}
          isJoinedSociety={(item) =>
            societyFollowing.some((f) => f.societyId === item.societyId)
          }
          isJoinedStudent={(item) =>
            studentFollowing.some((f) => f._id === item._id)
          }
          onJoinSociety={(item) => {
            const isJoined = societyFollowing.some(
              (f) => f.societyId === item.societyId,
            );
            isJoined
              ? handleToggleSocietyFollowing(item)
              : handleJoinSocietyFromSuggestion(item);
          }}
          onJoinStudent={(item) => {
            const isJoined = studentFollowing.some((f) => f._id === item._id);
            isJoined
              ? handleToggleStudentFollowing(item)
              : handleJoinStudentFromSuggestion(item);
          }}
          onSocietyClick={(item) =>
            navigate(`/society-profile?id=${item.societyId}`)
          }
          onStudentClick={(item) =>
            navigate(`/student-profile?id=${item.userId}`)
          }
        />

        {/* ── News ── */}
        <StudentNewsSection
          myNews={myNews}
          getUserId={getUserId}
          setMyNews={setMyNews}
        />

        {/* ── Edit Modal ── */}
        <EditStudentProfileModal
          student={student}
          showModal={showModal}
          previewUrl={previewUrl}
          editCollege={editCollege}
          setEditCollege={setEditCollege}
          editYear={editYear}
          setEditYear={setEditYear}
          getImageUrl={getImageUrl}
          defaultAvatar={DEFAULT_AVATAR}
          onImageChange={handleImageChange}
          onSave={handleSaveProfile}
          onClose={closeModal}
        />
      </div>
    </>
  );
}
