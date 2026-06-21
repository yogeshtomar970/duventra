import API_BASE_URL from "./config/api.js";

/**
 * newsHelpers.js
 * Dono News.jsx aur NewsCardWithActions.jsx mein use hone wale shared helpers.
 */

export const getUser = () => {
  try { return JSON.parse(localStorage.getItem("user")) || null; }
  catch { return null; }
};

export const fmt = (iso) =>
  new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
  });

export const resolveImg = (url) => {
  if (!url) return null;
  const fullUrl = url.startsWith("http")
    ? url
    : `${API_BASE_URL}/${url.replace(/^\//, "")}`;
  // Cloudinary URL hai → auto-compress + resize karo, feed ke liye full-res nahi chahiye
  if (fullUrl.includes("res.cloudinary.com")) {
    return fullUrl.replace("/upload/", "/upload/f_auto,q_auto,w_800/");
  }
  return fullUrl;
};
