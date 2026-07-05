import { useState } from "react";
import { toast } from "react-toastify";
import API_BASE_URL from "../config/api.js";

const getUserId = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  return user?.id || user?._id || null;
};

/**
 * useEditStudentProfile
 * Edit modal ka state + profile save handler.
 */
export default function useEditStudentProfile({ setStudent }) {
  const [showModal, setShowModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [editCollege, setEditCollege] = useState("");
  const [editYear, setEditYear] = useState("");

  const openModal = (student) => {
    setEditCollege(student.collegeName || "");
    setEditYear(student.year || "");
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setPreviewUrl(null);
    setSelectedImage(null);
  };

  const handleImageChange = (file) => {
    if (!file) return;
    setSelectedImage(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSaveProfile = async () => {
    const userId = getUserId();
    if (!userId) return toast.error("User not found");
    const token = localStorage.getItem("token");

    const formData = new FormData();
    if (selectedImage) formData.append("profilePic", selectedImage);
    if (editCollege.trim()) formData.append("collegeName", editCollege.trim());
    if (editYear.trim()) formData.append("year", editYear.trim());

    try {
      const res = await fetch(`${API_BASE_URL}/api/student/update/${userId}`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`, // Content-Type mat likho — FormData khud set karta hai
        },
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setStudent(data.student);
        closeModal();
      }
    } catch {}
  };

  return {
    showModal,
    setShowModal,
    selectedImage,
    previewUrl,
    editCollege,
    setEditCollege,
    editYear,
    setEditYear,
    openModal,
    closeModal,
    handleImageChange,
    handleSaveProfile,
  };
}
