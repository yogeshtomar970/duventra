import React from "react";
import { FaEdit, FaTrash } from "react-icons/fa";
import "../styles/DotMenu.css";

/**
 * DotMenu
 * Three-dot menu with Edit and Delete options.
 * Only shown to the card owner (canModify).
 */
export default function DotMenu({ show, setShow, onEdit, onDelete, editLabel = "Edit News", deleteLabel = "Delete News" }) {
  return (
    <div className="dot-menu-wrap">
      <button
        className="nc-delete-btn dot-menu-trigger"
        onClick={() => setShow((v) => !v)}
        title="Options"
      >
        ⋮
      </button>

      {show && (
        <>
          <div className="dot-menu-backdrop" onClick={() => setShow(false)} />
          <div className="dot-menu-dropdown">
            <button
              className="dot-menu-item dot-menu-item--edit"
              onClick={() => { setShow(false); onEdit(); }}
            >
              <FaEdit /> {editLabel}
            </button>
            <div className="dot-menu-divider" />
            <button
              className="dot-menu-item dot-menu-item--delete"
              onClick={() => { setShow(false); onDelete(); }}
            >
              <FaTrash /> {deleteLabel}
            </button>
          </div>
        </>
      )}
    </div>
  );
}