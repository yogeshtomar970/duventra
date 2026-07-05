import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import HomePage from "./component/Homepage";
import Notification from "./component/Notification";
import NewsPage from "./component/News";
import MessagePage from "./component/MessageCard";
import ProfilePage from "./component/ProfilePage";
import SocietyProfilePageLink from "./component/societyprofilelink";
import Login from "./component/Login";
import ForgotPassword from "./component/ForgotPassword";
import Signup from "./component/Welcome";
import StudentSignup from "./component/StudentSignup";
import SocietySignup from "./component/SocietySignup";
import Studentprofile from "./component/Profiles";
import NewsByLink from "./component/NewsByLink";

import UploadPost from "./component/UploadPost";
import CommentsCard from "./component/Comments";
import SocietyPublicProfile from "./component/SocietyPublicProfile";
import StudentPublicProfile from "./component/StudentPublicProfile";
import UploadNews from "./component/UploadNews";
import DescriptionCard from "./component/DescriptionCard";
import HelpSupport from "./component/HelpSupport";
import PrivacyPolicy from "./component/PrivacyPolicy";
import PostByLink from "./component/PostByLink";
// ✅ NEW: Install guide import
import InstallGuide from "./component/InstallGuide";

// ── Guard: login nahi hai toh /login par redirect ──
function ProtectedRoute({ children }) {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

// ── Guard: pehli baar aane wale users ko install guide dikhao ──
function InstallGuideGuard({ children }) {
  const alreadyShown = localStorage.getItem("installGuideShown");
  // Agar standalone mode mein hai (already installed) toh guide mat dikhao
  const isStandalone =
    window.matchMedia("(display-mode: standalone)").matches ||
    window.navigator.standalone === true;

  if (!alreadyShown && !isStandalone) {
    return <Navigate to="/install-guide" replace />;
  }
  return children;
}

function App() {
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    setAuthReady(true);
  }, []);

  if (!authReady) return null;

  return (
    <Router>
      <ToastContainer position="top-center" autoClose={3000} newestOnTop />
      <Routes>
        {/* ✅ Install Guide Route */}
        <Route path="/install-guide" element={<InstallGuide />} />

        {/* Public routes — install guide check hoga pehle */}
        <Route
          path="/"
          element={
            <InstallGuideGuard>
              <HomePage />
            </InstallGuideGuard>
          }
        />
        <Route path="/news" element={<div className="page-enter"><NewsPage /></div>} />
        <Route path="/login" element={<div className="page-enter"><Login /></div>} />
        <Route path="/forgot-password" element={<div className="page-enter"><ForgotPassword /></div>} />
        <Route path="/signup" element={<div className="page-enter"><Signup /></div>} />
        <Route path="/studentsignup" element={<div className="page-enter"><StudentSignup /></div>} />
        <Route path="/societysignup" element={<div className="page-enter"><SocietySignup /></div>} />
        <Route path="/society-profile" element={<div className="page-enter"><SocietyPublicProfile /></div>} />
        <Route path="/student-profile" element={<div className="page-enter"><StudentPublicProfile /></div>} />
        <Route path="/help" element={<div className="page-enter"><HelpSupport /></div>} />
        <Route path="/privacy-policy" element={<div className="page-enter"><PrivacyPolicy /></div>} />
        <Route path="/description" element={<div className="page-enter"><DescriptionCard /></div>} />
        <Route path="/commentlink" element={<div className="page-enter"><CommentsCard /></div>} />
        <Route path="/news/:newsId" element={<div className="page-enter"><NewsByLink /></div>} />   {/* ✅ News share link */}
          <Route path="/post/:postId" element={<div className="page-enter"><PostByLink /></div>} />  {/* ✅ Shared link route */}
        {/* Protected routes — login zaroori */}
        <Route path="/meesage" element={<ProtectedRoute><div className="page-enter"><MessagePage /></div></ProtectedRoute>} />
        <Route path="/societyprofile" element={<ProtectedRoute><div className="page-enter"><ProfilePage /></div></ProtectedRoute>} />
        <Route path="/studentprofile" element={<ProtectedRoute><div className="page-enter"><Studentprofile /></div></ProtectedRoute>} />
        <Route path="/notification" element={<ProtectedRoute><div className="page-enter"><Notification /></div></ProtectedRoute>} />
        <Route path="/societyprofilelink" element={<ProtectedRoute><div className="page-enter"><SocietyProfilePageLink /></div></ProtectedRoute>} />
        <Route path="/upload" element={<ProtectedRoute><div className="page-enter"><UploadPost /></div></ProtectedRoute>} />
        <Route path="/upload-news" element={<ProtectedRoute><div className="page-enter"><UploadNews /></div></ProtectedRoute>} />
      </Routes>
    </Router>
  );
}

export default App;
