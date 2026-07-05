import API_BASE_URL from "../config/api.js";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import confirmToast from "../utils/confirmToast.jsx";
import "../ProfilePage.css";

import BottomNav from "../component/BottomNav";
import Navbar from "../component/Navbar";
import Sidebar from "../component/sidebar";

// ── Extracted components ──
import ProfileCard from "../component/ProfileCard";
import EditProfileModal from "../component/EditProfileModal";
import EditPostModal from "../component/EditPostModal";
import CommitteeCard from "../component/CommitteeCard";
import CommitteeModal from "../component/CommitteeModal";
import SocietyConnectionsPanel from "../component/SocietyMemberCard";
import PostNewsTab from "../component/PostNewsTab";
import FeedLoader from "../component/FeedLoader";

export default function ProfilePage() {
  const navigate = useNavigate();

  // ── Core state ──
  const [society, setSociety] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // ── Modal state ──
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [showCommitteeModal, setShowCommitteeModal] = useState(false);

  // ── Edit Post state ──
  const [showEditPostModal, setShowEditPostModal] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [editDescription, setEditDescription] = useState("");
  const [editFormLink, setEditFormLink] = useState("");

  // ── Tab state ──
  const [activeTab, setActiveTab] = useState("post");

  // ── Data state ──
  const [myNews, setMyNews] = useState([]);
  const [myPosts, setMyPosts] = useState([]);
  const [members, setMembers] = useState([]);
  const [studentMembers, setStudentMembers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [studentSuggestions, setStudentSuggestions] = useState([]);
  const [studentFollowing, setStudentFollowing] = useState([]);


  // ── Sidebar scroll lock ──
  useEffect(() => {
    document.body.classList.toggle("no-scroll", sidebarOpen);
  }, [sidebarOpen]);

  // ── Fetch profile — GET, token nahi chahiye ──
  const fetchProfile = async (id) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/society/profile/${id}`);
      const data = await res.json();
      setSociety(data.data);
      setLoading(false);
    } catch {
      setLoading(false);
    }
  };

  // ── Initial data fetches — GET calls, token nahi chahiye ──
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user?.id) {
      fetchProfile(user.id);
      fetch(`${API_BASE_URL}/api/news/user/${user.id}`)
        .then((r) => r.json())
        .then((data) => setMyNews(Array.isArray(data.news) ? data.news : []))
        .catch(() => {});
    }
  }, []);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user?.societyId) return;
    fetch(`${API_BASE_URL}/api/join/suggestions/${user.societyId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setSuggestions(data.data);
      })
      .catch(() => {});
    fetch(`${API_BASE_URL}/api/join/following/${user.societyId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setFollowing(data.data);
      })
      .catch(() => {});
    fetch(`${API_BASE_URL}/api/join/members/${user.societyId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setMembers(
            data.data.filter(
              (m) => !m.memberType || m.memberType === "society",
            ),
          );
          setStudentMembers(
            data.data.filter((m) => m.memberType === "student"),
          );
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user?.societyId) return;
    fetch(`${API_BASE_URL}/api/student/suggestions/${user.societyId}`)
      .then((r) => r.json())
      .then((data) => { if (data.success) setStudentSuggestions(data.data); })
      .catch(() => {});
    fetch(`${API_BASE_URL}/api/student/following/${user.societyId}`)
      .then((r) => r.json())
      .then((data) => { if (data.success) setStudentFollowing(data.data); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user?.id || !society) return;
    fetch(`${API_BASE_URL}/api/post/all`)
      .then((r) => r.json())
      .then((data) =>
        setMyPosts(
          data.posts.filter((p) => p.societyName === society.societyName),
        ),
      )
      .catch(() => {});
  }, [society]);

  // ── Follow / unfollow helpers ──
  const societyJoin = async (myId, targetId) => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_BASE_URL}/api/join/join`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ myId, targetId }),
    });
    return res.json();
  };

  const societyUnjoin = async (myId, targetId) => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_BASE_URL}/api/join/unjoin`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ myId, targetId }),
    });
    return res.json();
  };

  const handleJoinFromSuggestion = async (item) => {
    const user = JSON.parse(localStorage.getItem("user"));
    const data = await societyJoin(user.societyId, item.societyId);
    if (data.joined) {
      setSuggestions((p) => p.filter((s) => s.societyId !== item.societyId));
      setFollowing((p) => [...p, item]);
    }
  };

  const handleToggleFollowing = async (item) => {
    const user = JSON.parse(localStorage.getItem("user"));
    const isFollowing = following.some((f) => f.societyId === item.societyId);
    if (isFollowing) {
      const data = await societyUnjoin(user.societyId, item.societyId);
      if (!data.joined) {
        setFollowing((p) => p.filter((f) => f.societyId !== item.societyId));
        setSuggestions((p) => [...p, item]);
      }
    } else {
      const data = await societyJoin(user.societyId, item.societyId);
      if (data.joined) {
        setSuggestions((p) => p.filter((s) => s.societyId !== item.societyId));
        setFollowing((p) => [...p, item]);
      }
    }
  };

  const handleToggleMemberFollow = async (item) => {
    const user = JSON.parse(localStorage.getItem("user"));
    const isFollowing = following.some((f) => f.societyId === item.societyId);
    if (isFollowing) {
      const data = await societyUnjoin(user.societyId, item.societyId);
      if (!data.joined)
        setFollowing((p) => p.filter((f) => f.societyId !== item.societyId));
    } else {
      const data = await societyJoin(user.societyId, item.societyId);
      if (data.joined) setFollowing((p) => [...p, item]);
    }
  };

  const handleJoinStudentFromSuggestion = async (item) => {
    const user = JSON.parse(localStorage.getItem("user"));
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_BASE_URL}/api/student/follow`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ myId: user.societyId, targetId: item._id.toString(), followerType: "society" }),
    });
    const data = await res.json();
    if (data.followed) {
      setStudentSuggestions((p) => p.filter((s) => s._id !== item._id));
      setStudentFollowing((p) => [...p, item]);
    }
  };

  const handleToggleStudentFollowing = async (item) => {
    const user = JSON.parse(localStorage.getItem("user"));
    const token = localStorage.getItem("token");
    const isJoined = studentFollowing.some((f) => f._id === item._id);
    if (isJoined) {
      const res = await fetch(`${API_BASE_URL}/api/student/unfollow`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ myId: user.societyId, targetId: item._id.toString() }),
      });
      const data = await res.json();
      if (!data.followed) {
        setStudentFollowing((p) => p.filter((f) => f._id !== item._id));
        setStudentSuggestions((p) => [...p, item]);
      }
    } else {
      const res = await fetch(`${API_BASE_URL}/api/student/follow`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ myId: user.societyId, targetId: item._id.toString(), followerType: "society" }),
      });
      const data = await res.json();
      if (data.followed) {
        setStudentSuggestions((p) => p.filter((s) => s._id !== item._id));
        setStudentFollowing((p) => [...p, item]);
      }
    }
  };

  // ── Post edit / delete ──
  const handleEditPostOpen = (post) => {
    setEditingPost(post);
    setEditDescription(post.description || "");
    setEditFormLink(post.formLink || "");
    setShowEditPostModal(true);
  };

  const handleUpdatePost = async () => {
    const user = JSON.parse(localStorage.getItem("user"));
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/post/update/${editingPost._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            societyId: user.societyId,
            description: editDescription,
            formLink: editFormLink,
          }),
        },
      );
      const data = await res.json();
      if (data.success) {
        toast.success("Post updated successfully!");
        setMyPosts((p) =>
          p.map((post) =>
            post._id === editingPost._id
              ? {
                  ...post,
                  description: editDescription,
                  formLink: editFormLink,
                }
              : post,
          ),
        );
        setShowEditPostModal(false);
        setEditingPost(null);
      } else {
        toast.error(data.message || "Update failed");
      }
    } catch {
      toast.error("Server error");
    }
  };

  const handleDeletePost = async (post) => {
    if (!(await confirmToast("Do you really want to delete this post?")))
      return;
    const user = JSON.parse(localStorage.getItem("user"));
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_BASE_URL}/api/post/delete/${post._id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ societyId: user.societyId }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Post deleted!");
        setMyPosts((p) => p.filter((pp) => pp._id !== post._id));
      } else {
        toast.error(data.message || "Delete failed");
      }
    } catch {
      toast.error("Server error");
    }
  };

if (loading) return <FeedLoader />;

  return (
    <>
      <Navbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <BottomNav />

      <div className="profile-container">
        {/* ── Profile Card ── */}
        <ProfileCard
          society={society}
          onEditClick={() => setShowEditProfileModal(true)}
        />

        {/* ── Edit Profile Modal ── */}
        {showEditProfileModal && (
          <EditProfileModal
            onClose={() => setShowEditProfileModal(false)}
            society={society}
            onSocietyUpdate={(updated) => setSociety(updated)}
          />
        )}

        {/* ── Edit Post Modal ── */}
        {showEditPostModal && editingPost && (
          <EditPostModal
            editDescription={editDescription}
            setEditDescription={setEditDescription}
            editFormLink={editFormLink}
            setEditFormLink={setEditFormLink}
            onSave={handleUpdatePost}
            onClose={() => {
              setShowEditPostModal(false);
              setEditingPost(null);
            }}
          />
        )}

        {/* ── Committee Card ── */}
        <CommitteeCard
          committee={society?.committee}
          onEditClick={() => setShowCommitteeModal(true)}
        />

        {/* ── Committee Modal ── */}
        {showCommitteeModal && (
          <CommitteeModal
            committee={society?.committee}
            onClose={() => setShowCommitteeModal(false)}
            onSocietyUpdate={(updated) => setSociety(updated)}
          />
        )}
        {/* ── Connections Panel ── */}
        <SocietyConnectionsPanel
          members={members}
          studentMembers={studentMembers}
          following={following}
          studentFollowing={studentFollowing}
          suggestions={suggestions}
          studentSuggestions={studentSuggestions}
          isJoinedSociety={(item) => following.some((f) => f.societyId === item.societyId)}
          isJoinedStudent={(item) => studentFollowing.some((f) => f._id === item._id)}
          onJoinSociety={(item) => {
            const isJoined = following.some((f) => f.societyId === item.societyId);
            isJoined ? handleToggleFollowing(item) : handleJoinFromSuggestion(item);
          }}
          onJoinStudent={(item) => {
            const isJoined = studentFollowing.some((f) => f._id === item._id);
            isJoined ? handleToggleStudentFollowing(item) : handleJoinStudentFromSuggestion(item);
          }}
          onSocietyClick={(item) => navigate(`/society-profile?id=${item.societyId}`)}
          onStudentClick={(item) => navigate(`/student-profile?id=${item.userId}`)}
        />
        {/* ── Post / News Tab ── */}
        <PostNewsTab
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          myPosts={myPosts}
          myNews={myNews}
          society={society}
          onEditPost={handleEditPostOpen}
          onDeletePost={handleDeletePost}
          onNewsUpdated={(updated) =>
            setMyNews((p) =>
              p.map((n) => (n._id === updated._id ? updated : n)),
            )
          }
          onNewsDeleted={(id) =>
            setMyNews((p) => p.filter((n) => n._id !== id))
          }
        />
      </div>
    </>
  );
}
