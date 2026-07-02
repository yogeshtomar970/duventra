import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { showSuccess, showError } from "../utils/Toast.js";
import API_BASE_URL from "../config/api.js";

/**
 * useLogin
 * Email/password state aur login API call handler.
 */
export default function useLogin() {
  const navigate = useNavigate();
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const result = await res.json();

      if (res.ok) {
        showSuccess(result.message || "Login successful!");
        localStorage.setItem("token", result.token);
        const userData = { ...result.user, role: result.role };
        localStorage.setItem("user", JSON.stringify(userData));
        window.dispatchEvent(new StorageEvent("storage", { key: "user" }));
        navigate("/");
      } else {
        showError(result.message || "Login failed");
      }
    } catch {
      showError("Server error");
    }
  };

  return { email, setEmail, password, setPassword, handleLogin };
}