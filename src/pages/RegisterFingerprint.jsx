import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import authService from "../utils/auth";

const palette = {
  darkest: "#031716",
  darkTeal: "#032F30",
  teal: "#0A7075",
  midTeal: "#0C969C",
  lightBlue: "6BA3BE",
  blueGray: "#274D60"
};

export default function RegisterFingerprint() {
  const navigate = useNavigate();
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    // Prevent navigation back to login/register when authenticated
    if (authService.isAuthenticated()) {
      const handlePopState = (event) => {
        event.preventDefault();
        window.history.pushState(null, null, "/register-fingerprint");
      };

      window.history.pushState(null, null, "/register-fingerprint");
      window.addEventListener("popstate", handlePopState);

      return () => {
        window.removeEventListener("popstate", handlePopState);
      };
    }

    // Get user email for display
    const user = authService.getUser();
    if (user?.email) {
      setUserEmail(user.email);
    }
  }, []);

  function handleLogout() {
    authService.logoutAndRedirect(navigate);
  }

  return (
    <div
      style={{
        height: "100vh",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: `linear-gradient(135deg, #6BA3BE 0%, #0C969C 50%, #0A7075 100%)`,
        padding: "1rem",
        boxSizing: "border-box"
      }}
    >
      <style>{`
        * { box-sizing: border-box; }
        body, html { margin: 0; padding: 0; height: 100%; overflow: hidden; }
        .register-card { background: rgba(255,255,255,0.95); border-radius: 16px; box-shadow: 0 8px 32px rgba(44,62,80,0.15); padding: 1.5rem; width: 100%; max-width: 420px; backdrop-filter: blur(12px); margin: auto; text-align: center; }
        .register-title { color: #031716; font-weight: 700; font-size: 1.4rem; margin-bottom: 0.3rem; letter-spacing: 0.5px; }
        .register-desc { color: #274D60; font-size: 0.95rem; margin-bottom: 1rem; line-height: 1.4; }
        .user-email { color: #0A7075; font-weight: 600; font-size: 0.9rem; margin-bottom: 1rem; padding: 0.75rem; background: rgba(10,112,117,0.08); border-radius: 8px; border: 1px solid rgba(10,112,117,0.12); }
        .action-buttons { display: flex; flex-direction: column; gap: 0.75rem; }
        .logout-btn { width: 100%; padding: 0.75rem 0; background: #274D60; color: #fff; font-size: 1rem; font-weight: 600; border: none; border-radius: 8px; box-shadow: 0 2px 8px rgba(44,62,80,0.10); cursor: pointer; }
        .logout-btn:hover { background: #032F30; transform: translateY(-1px); }
        .kiosk-note { background: rgba(12,150,156,0.06); border-radius: 8px; padding: 1rem; margin-bottom: 1rem; border: 1px solid rgba(12,150,156,0.08); }
      `}</style>

      <div className="register-card">
        <div className="register-title">Fingerprint Registration Required</div>
        <div className="register-desc">
          For account security, a fingerprint is required to complete sign-in. Please visit the Lib-Track Kiosk to register your fingerprint.
        </div>

        {userEmail && (
          <div className="user-email">Account: {userEmail}</div>
        )}

        <div className="kiosk-note">
          <strong>Where to register</strong>
          <div style={{ marginTop: 8, color: '#274D60' }}>
            Visit any Lib-Track Kiosk on campus and follow the on-screen instructions to enroll your fingerprint. If you don't know the kiosk location, contact the library help desk.
          </div>
        </div>

        <div className="action-buttons">
          <button className="logout-btn" onClick={handleLogout}>Log Out</button>
        </div>
      </div>
    </div>
  );
}
