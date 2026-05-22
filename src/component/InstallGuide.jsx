import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Detect which browser/OS the user is on
function detectPlatform() {
  const ua = navigator.userAgent || "";
  const isIOS = /iPad|iPhone|iPod/.test(ua);
  const isAndroid = /Android/.test(ua);
  const isSamsung = /SamsungBrowser/.test(ua);
  const isChrome = /Chrome/.test(ua) && !/Edg|OPR/.test(ua);
  const isFirefox = /Firefox/.test(ua);
  const isSafari = /Safari/.test(ua) && !isChrome;

  if (isIOS && isSafari) return "ios-safari";
  if (isIOS && isChrome) return "ios-chrome";
  if (isAndroid && isSamsung) return "android-samsung";
  if (isAndroid && isChrome) return "android-chrome";
  if (isAndroid && isFirefox) return "android-firefox";
  return "desktop";
}

// Steps for each platform
const STEPS = {
  "android-chrome": {
    browser: "Chrome (Android)",
    icon: "🌐",
    steps: [
      { icon: "⋮", text: 'Upar right corner mein teen dots (⋮) par tap karo' },
      { icon: "📲", text: '"Add to Home screen" ya "Install app" option dhundho' },
      { icon: "✅", text: 'Pop-up aaye toh "Install" ya "Add" tap karo' },
      { icon: "🏠", text: 'App ab aapke Home Screen par aa gayi!' },
    ],
  },
  "android-samsung": {
    browser: "Samsung Internet",
    icon: "🌐",
    steps: [
      { icon: "☰", text: 'Neeche menu icon (≡) par tap karo' },
      { icon: "➕", text: '"Add page to" → "Home screen" select karo' },
      { icon: "✅", text: '"Add" button tap karo' },
      { icon: "🏠", text: 'App Home Screen par install ho gayi!' },
    ],
  },
  "android-firefox": {
    browser: "Firefox (Android)",
    icon: "🦊",
    steps: [
      { icon: "⋮", text: 'Right corner mein teen dots par tap karo' },
      { icon: "📲", text: '"Install" ya "Add to Home Screen" dhundho' },
      { icon: "✅", text: 'Confirm karo' },
      { icon: "🏠", text: 'Home Screen par shortcut ban gayi!' },
    ],
  },
  "ios-safari": {
    browser: "Safari (iPhone/iPad)",
    icon: "🧭",
    steps: [
      { icon: "⬆️", text: 'Neeche Share button (⬆️) par tap karo' },
      { icon: "📲", text: 'Scroll karke "Add to Home Screen" dhundho' },
      { icon: "✏️", text: 'Naam change karo ya waise hi chhod do, phir "Add" tap karo' },
      { icon: "🏠", text: 'App Home Screen par aa gayi bilkul native app ki tarah!' },
    ],
  },
  "ios-chrome": {
    browser: "Chrome (iPhone)",
    icon: "🌐",
    steps: [
      { icon: "⬆️", text: 'Neeche Share icon (⬆️) par tap karo' },
      { icon: "📲", text: '"Add to Home Screen" option select karo' },
      { icon: "✅", text: '"Add" tap karo' },
      { icon: "🏠", text: 'Done! App Home Screen par mil jaayegi' },
    ],
  },
  desktop: {
    browser: "Desktop / Chrome",
    icon: "💻",
    steps: [
      { icon: "⋮", text: 'Browser ke upar right mein teen dots par click karo' },
      { icon: "📲", text: '"Cast, save, and share" → "Install page as app" click karo' },
      { icon: "✅", text: 'Pop-up mein "Install" click karo' },
      { icon: "🏠", text: 'App desktop par shortcut ki tarah khulegi!' },
    ],
  },
};

export default function InstallGuide() {
  const navigate = useNavigate();
  const [platform, setPlatform] = useState("android-chrome");
  const [currentStep, setCurrentStep] = useState(0);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    setPlatform(detectPlatform());
  }, []);

  const info = STEPS[platform] || STEPS["android-chrome"];

  function handleSkip() {
    localStorage.setItem("installGuideShown", "true");
    navigate("/");
  }

  function nextStep() {
    if (currentStep < info.steps.length - 1) {
      setAnimating(true);
      setTimeout(() => {
        setCurrentStep((s) => s + 1);
        setAnimating(false);
      }, 200);
    } else {
      handleSkip();
    }
  }

  const step = info.steps[currentStep];
  const isLast = currentStep === info.steps.length - 1;

  return (
    <div style={styles.overlay}>
      <div style={styles.card}>

        {/* Top: Logo + Title */}
        <div style={styles.header}>
          <img src="/logo.png" alt="logo" style={styles.logo} />
          <h1 style={styles.title}>App Install Karo 📲</h1>
          <p style={styles.subtitle}>
            Duventra ko apne phone par <strong>directly app ki tarah</strong> use karo — bilkul free!
          </p>
        </div>

        {/* Browser badge */}
        <div style={styles.browserBadge}>
          <span style={{ fontSize: 16 }}>{info.icon}</span>
          <span style={styles.browserText}>{info.browser} ke liye</span>
        </div>

        {/* Step progress dots */}
        <div style={styles.dots}>
          {info.steps.map((_, i) => (
            <div
              key={i}
              style={{
                ...styles.dot,
                background: i === currentStep ? "#6C63FF" : i < currentStep ? "#a29bf5" : "#e0e0e0",
                width: i === currentStep ? 20 : 8,
              }}
            />
          ))}
        </div>

        {/* Current step card */}
        <div
          style={{
            ...styles.stepCard,
            opacity: animating ? 0 : 1,
            transform: animating ? "translateY(8px)" : "translateY(0)",
          }}
        >
          <div style={styles.stepNum}>Step {currentStep + 1}</div>
          <div style={styles.stepIcon}>{step.icon}</div>
          <p style={styles.stepText}>{step.text}</p>
        </div>

        {/* Buttons */}
        <div style={styles.buttonRow}>
          <button onClick={handleSkip} style={styles.skipBtn}>
            Baad mein
          </button>
          <button onClick={nextStep} style={styles.nextBtn}>
            {isLast ? "Done! 🎉" : "Agla Step →"}
          </button>
        </div>

        {/* Tip */}
        <p style={styles.tip}>
          💡 Ek baar install karne ke baad yeh guide dobara nahi aayegi
        </p>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #6C63FF 0%, #3f3d8f 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "16px",
    fontFamily: "'Segoe UI', sans-serif",
  },
  card: {
    background: "#fff",
    borderRadius: 24,
    padding: "28px 24px 20px",
    maxWidth: 400,
    width: "100%",
    boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 16,
  },
  header: {
    textAlign: "center",
  },
  logo: {
    width: 64,
    height: 64,
    borderRadius: 16,
    marginBottom: 10,
    objectFit: "contain",
  },
  title: {
    margin: "0 0 6px",
    fontSize: 22,
    fontWeight: 700,
    color: "#1a1a2e",
  },
  subtitle: {
    margin: 0,
    fontSize: 14,
    color: "#555",
    lineHeight: 1.5,
  },
  browserBadge: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    background: "#f0eeff",
    borderRadius: 20,
    padding: "6px 14px",
  },
  browserText: {
    fontSize: 13,
    color: "#6C63FF",
    fontWeight: 600,
  },
  dots: {
    display: "flex",
    gap: 6,
    alignItems: "center",
  },
  dot: {
    height: 8,
    borderRadius: 4,
    transition: "all 0.3s ease",
  },
  stepCard: {
    width: "100%",
    background: "#f7f6ff",
    borderRadius: 16,
    padding: "20px 16px",
    textAlign: "center",
    transition: "all 0.2s ease",
    border: "2px solid #e8e5ff",
  },
  stepNum: {
    fontSize: 11,
    fontWeight: 700,
    color: "#6C63FF",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 8,
  },
  stepIcon: {
    fontSize: 36,
    marginBottom: 10,
  },
  stepText: {
    margin: 0,
    fontSize: 15,
    color: "#333",
    lineHeight: 1.6,
    fontWeight: 500,
  },
  buttonRow: {
    display: "flex",
    gap: 10,
    width: "100%",
  },
  skipBtn: {
    flex: 1,
    padding: "12px 0",
    borderRadius: 12,
    border: "2px solid #e0e0e0",
    background: "transparent",
    color: "#888",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
  },
  nextBtn: {
    flex: 2,
    padding: "12px 0",
    borderRadius: 12,
    border: "none",
    background: "linear-gradient(135deg, #6C63FF, #3f3d8f)",
    color: "#fff",
    fontSize: 15,
    fontWeight: 700,
    cursor: "pointer",
    boxShadow: "0 4px 15px rgba(108,99,255,0.4)",
  },
  tip: {
    margin: 0,
    fontSize: 12,
    color: "#aaa",
    textAlign: "center",
  },
};
