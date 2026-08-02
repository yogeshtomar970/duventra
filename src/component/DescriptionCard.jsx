import React from "react";
import "../DescriptionCard.css";

// Agar link me http:// ya https:// nahi hai to window.open use current
// domain ke relative path samajh leta hai — isliye protocol add kar dete hain
const getSafeExternalLink = (url) => {
  if (!url) return "";
  const trimmed = url.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
};

const DescriptionCard = ({ description, formLink }) => {
  return (
    <div className="desc-card">
      <h1>Description</h1>

      <p className="desc-text">{description}</p>

      <div className="desc-footer">
        {formLink && (
          <h4
            className="form-link"
            onClick={() => window.open(getSafeExternalLink(formLink), "_blank")}
            style={{ cursor: "pointer", color: "blue" }}
          >
            Form Link
          </h4>
        )}
      </div>
    </div>
  );
};

export default DescriptionCard;