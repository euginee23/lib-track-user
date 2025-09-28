import React, { useState, useEffect } from "react";
import { IoEyeOutline, IoEyeOffOutline } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import ToastNotification from "../components/ToastNotification";
import { loginUser } from "../../api/login/user_login";
import authService from "../utils/auth";
import WebSocketClient from "../../api/websockets/websocket-client";

const palette = {
  darkest: "#1a1a1a",
  darkTeal: "#14505c",
  teal: "#1fb6ff",
  midTeal: "#43c6ac",
  lightBlue: "#e0f7fa",
  blueGray: "#607d8b",
};

const wsClient = new WebSocketClient();
wsClient.connect();

export default function LoginToKiosk() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // CHECKS IF ALREADY LOGGED IN
    if (authService.isAuthenticated()) {
      const user = authService.getUser();
      ToastNotification.success("Successfully logged in to kiosk.");
      setLoggedIn(true);

      // Emit logged-in user details
      wsClient.send("user-logged-in", user);
    }
  }, []);

  async function handleLogin(e) {
    e.preventDefault();

    if (!username) {
      ToastNotification.error("Please enter your username.");
      return;
    }

    if (!password) {
      ToastNotification.error("Please enter your password.");
      return;
    }

    try {
      setLoading(true);
      const response = await loginUser(username, password);

      ToastNotification.success("Successfully logged in to kiosk.");
      setLoggedIn(true);

      // Emit logged-in user details
      wsClient.send("user-logged-in", response.user);
    } catch (error) {
      ToastNotification.error(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        height: "100vh",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: `linear-gradient(135deg, ${palette.lightBlue} 0%, ${palette.midTeal} 50%, ${palette.teal} 100%)`,
        padding: "1rem",
        boxSizing: "border-box",
      }}
    >
      <style>{`
        * {
          box-sizing: border-box;
        }
        body, html {
          margin: 0;
          padding: 0;
          height: 100%;
          overflow: hidden;
        }
        .login-card {
          background: rgba(255,255,255,0.98);
          border-radius: 16px;
          box-shadow: 0 8px 32px rgba(44,62,80,0.18);
          padding: 1.5rem;
          width: 100%;
          max-width: 350px;
          backdrop-filter: blur(12px);
          margin: auto;
          text-align: center;
        }
        .login-title {
          color: ${palette.darkest};
          font-weight: 700;
          font-size: 1.4rem;
          margin-bottom: 1rem;
          letter-spacing: 0.5px;
        }
        .login-label {
          color: ${palette.darkTeal};
          font-size: 1rem;
          margin-bottom: 0.3rem;
          font-weight: 600;
          display: block;
        }
        .input-container {
          position: relative;
          margin-bottom: 1rem;
        }
        .login-input {
          width: 100%;
          padding: 0.6rem 1rem;
          border-radius: 8px;
          border: 2px solid ${palette.teal};
          background: #e0f7fa;
          color: ${palette.darkest};
          font-size: 1.05rem;
          outline: none;
          transition: border-color 0.2s, background 0.2s;
        }
        .login-input:focus {
          border-color: ${palette.darkTeal};
          background: #fff;
        }
        .password-input {
          padding-right: 2.5rem;
        }
        .password-toggle {
          position: absolute;
          right: 0.75rem;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: ${palette.blueGray};
          cursor: pointer;
          font-size: 1.2rem;
          padding: 0.25rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .password-toggle:hover {
          color: ${palette.teal};
        }
        .login-btn {
          width: 100%;
          padding: 0.75rem 0;
          background: linear-gradient(90deg, ${palette.teal} 0%, ${palette.midTeal} 100%);
          color: #fff;
          font-size: 1rem;
          font-weight: 600;
          border: none;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(44,62,80,0.10);
          cursor: pointer;
          transition: all 0.2s;
        }
        .login-btn:hover {
          background: linear-gradient(90deg, ${palette.midTeal} 0%, ${palette.teal} 100%);
          transform: translateY(-1px);
        }
        .success-message {
          color: ${palette.teal};
          font-size: 1.2rem;
          margin-bottom: 1rem;
        }
        .exit-btn {
          padding: 0.5rem 1rem;
          background: ${palette.teal};
          color: #fff;
          font-size: 1rem;
          font-weight: 600;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          transition: background 0.2s;
        }
        .exit-btn:hover {
          background: ${palette.midTeal};
        }
      `}</style>
      {loggedIn ? (
        <div className="login-card">
          <div className="success-message">Successfully logged in to kiosk.</div>
          <button className="exit-btn" onClick={() => navigate("/")}>Exit</button>
        </div>
      ) : (
        <form className="login-card" onSubmit={handleLogin}>
          <div className="login-title">Login to Kiosk</div>

          <label className="login-label" htmlFor="username">
            Email | Phone Number | Student ID
          </label>
          <div className="input-container">
            <input
              className="login-input"
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <label className="login-label" htmlFor="password">
            Password
          </label>
          <div className="input-container">
            <input
              className="login-input password-input"
              type={showPassword ? "text" : "password"}
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <IoEyeOffOutline /> : <IoEyeOutline />}
            </button>
          </div>

          <button className="login-btn" type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Log In"}
          </button>
        </form>
      )}
    </div>
  );
}
