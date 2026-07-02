import React from "react";
import logo from "../assets/logo.png";
import "../SplashScreen.css";

export default function SplashScreen() {
  return (
    <div className="splash-root">
      <div className="splash-logo-wrap">
        <img src={logo} alt="App Logo" className="splash-logo" />
      </div>
    </div>
  );
}