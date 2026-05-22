import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import HomePage from "./component/Homepage";
import Notification from "./component/Notification";
import NewsPage from "./component/News";
import MessagePage from "./component/MessageCard";
import ProfilePage from "./component/ProfilePage";
import SocietyProfilePageLink from "./component/societyprofilelink";
import Login from "./component/Login";
import Signup from "./component/Welcome";
import StudentSignup from "./component/StudentSignup";
import SocietySignup from "./component/SocietySignup";
import Studentprofile from "./component/Profiles";

import UploadPost from "./component/UploadPost";
import CommentsCard from "./component/Comments";
import SocietyPublicProfile from "./component/SocietyPublicProfile";
import StudentPublicProfile from "./component/StudentPublicProfile";
import UploadNews from "./component/UploadNews";
import DescriptionCard from "./component/DescriptionCard";
import HelpSupport from "./component/HelpSupport";
import PrivacyPolicy from "./component/PrivacyPolicy";

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
        <Route path="/news" element={<NewsPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/studentsignup" element={<StudentSignup />} />
        <Route path="/societysignup" element={<SocietySignup />} />
        <Route path="/society-profile" element={<SocietyPublicProfile />} />
        <Route path="/student-profile" element={<StudentPublicProfile />} />
        <Route path="/help" element={<HelpSupport />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/description" element={<DescriptionCard />} />
        <Route path="/commentlink" element={<CommentsCard />} />

        {/* Protected routes — login zaroori */}
        <Route path="/meesage" element={<ProtectedRoute><MessagePage /></ProtectedRoute>} />
        <Route path="/societyprofile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="/studentprofile" element={<ProtectedRoute><Studentprofile /></ProtectedRoute>} />
        <Route path="/notification" element={<ProtectedRoute><Notification /></ProtectedRoute>} />
        <Route path="/societyprofilelink" element={<ProtectedRoute><SocietyProfilePageLink /></ProtectedRoute>} />
        <Route path="/upload" element={<ProtectedRoute><UploadPost /></ProtectedRoute>} />
        <Route path="/upload-news" element={<ProtectedRoute><UploadNews /></ProtectedRoute>} />
      </Routes>
    </Router>
  );
}

export default App;
