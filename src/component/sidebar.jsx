import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaHome, FaUser, FaEnvelope,FaBell, FaKey  } from "react-icons/fa";
import "../sidebar.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faNewspaper } from "@fortawesome/free-solid-svg-icons";
import API_BASE_URL from "../config/api.js";

export default function Sidebar({ sidebarOpen, setSidebarOpen }) {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user")) || null;
  const close = () => setSidebarOpen(false);
  const navClass = ({ isActive }) => (isActive ? "icon active" : "icon");

  const handleLogout = () => {
    localStorage.removeItem("user");
    close();
    navigate("/login");
  };

  return (
    <>
      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <div className="sidebar-brand">Duventra</div>
          {user && (
            <div className="sidebar-user">
              <div className="sidebar-user-avatar">
                {user.profilePic ? (
                  <img
                    src={user.profilePic.startsWith("http") ? user.profilePic : `${API_BASE_URL}${user.profilePic}`}
                    alt={user.name || "Profile"}
                    className="sidebar-user-avatar-img"
                  />
                ) : (
                  (user.name || user.societyName || user.email || "U")[0].toUpperCase()
                )}
              </div>
              <div>
                <div className="sidebar-user-email">
                  {user.name || user.email}
                </div>
                <div className="sidebar-user-role">{user.role}</div>
              </div>
            </div>
          )}
        </div>

        <nav className="sidebar-nav">
          <Link to="/" onClick={close} className={navClass}>
            <div className="sidebar-item">
              <FaHome /> Home
            </div>
          </Link>

          <Link to="/news" onClick={close}>
            <div className="sidebar-item">
              <FontAwesomeIcon icon={faNewspaper} /> News
            </div>
          </Link>

          <Link to="/meesage"  onClick={close} className={navClass}>
           <div className="sidebar-item">
            <FaEnvelope /> Meesage
            </div>
          </Link>

          <Link to="/notification" onClick={close}>
            <div className="sidebar-item">
              <FaBell /> Notifications
            </div>
          </Link>

          {!user && (
            <>
              <div className="sidebar-divider" />
              <Link to="/login" onClick={close}>
                <div className="sidebar-item">
                 <FaKey/> Login
                </div>
              </Link>
              <Link to="/signup" onClick={close}>
                <div className="sidebar-item">
                  <span>✍️</span> Sign Up
                </div>
              </Link>
            </>
          )}

          {user?.role === "student" && (
            <Link to="/studentprofile" onClick={close}>
              <div className="sidebar-item">
                <FaUser /> My Profile
              </div>
            </Link>
          )}
          {user?.role === "society" && (
            <Link to="/societyprofile" onClick={close}>
              <div className="sidebar-item">
                <FaUser /> My Profile
              </div>
            </Link>
          )}

          <div className="sidebar-divider" />
          <Link to="/privacy-policy" onClick={close}>
            <div className="sidebar-item">
              <span>🔒</span> Privacy Policy
            </div>
          </Link>
          <Link to="/help" onClick={close}>
            <div className="sidebar-item">
              <span>❓</span> Help & Support
            </div>
          </Link>

          {user && (
            <div className="sidebar-item logout-item" onClick={handleLogout}>
              <span>🚪</span> Logout
            </div>
          )}
        </nav>
      </aside>

      {sidebarOpen && <div className="sidebar-overlay" onClick={close} />}
    </>
  );
}