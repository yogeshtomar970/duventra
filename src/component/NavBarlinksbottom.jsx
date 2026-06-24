import React from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { FaHome, FaUser, FaEnvelope } from "react-icons/fa";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faNewspaper } from "@fortawesome/free-solid-svg-icons";

export default function NavBarlinksbottom({ profilePath, menuOpen, onFabClick }) {
  const navClass = ({ isActive }) => (isActive ? "icon active" : "icon");
  const navigate = useNavigate();
  const location = useLocation();

  const user = JSON.parse(localStorage.getItem("user")) || null;

  // Same path pe click → reload, warna normal navigate (with login guard)
  const handleClick = (e, path, requiresLogin = false) => {
    if (requiresLogin && !user) {
      e.preventDefault();
      navigate("/login");
      return;
    }
    const currentPath = location.pathname;
    const isSame = path === "/"
      ? currentPath === "/"
      : currentPath === path || currentPath.startsWith(path);
    if (isSame) {
      e.preventDefault();
      window.location.reload();
    }
  };

  return (
    <nav className="bottom-nav">
      <NavLink to="/" end className={navClass} onClick={(e) => handleClick(e, "/")}>
        <FaHome />
      </NavLink>

      <NavLink to="/news" className={navClass} onClick={(e) => handleClick(e, "/news")}>
        <FontAwesomeIcon icon={faNewspaper} />
      </NavLink>

      <NavLink
        to="/meesage"
        className={navClass}
        onClick={(e) => handleClick(e, "/meesage", true)}
      >
        <FaEnvelope />
      </NavLink>

      <NavLink
        to={profilePath}
        className={navClass}
        onClick={(e) => handleClick(e, profilePath, true)}
      >
        <FaUser />
      </NavLink>
    </nav>
  );
}
