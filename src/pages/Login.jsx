import React, { useState } from "react";
import { Link } from "react-router-dom";
import { IoEyeOutline, IoEyeOffOutline } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import ToastNotification from "../components/ToastNotification";
import { loginUser } from "../../api/login/user_login";

const palette = {
  darkest: "#031716",
  darkTeal: "#032F30",
  teal: "#0A7075",
  midTeal: "#0C969C",
  lightBlue: "#6BA3BE",
  blueGray: "#274D60"
};

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();

    if (!email) {
      ToastNotification.error("Please enter your email, student ID, or contact number.");
      return;
    }

    if (!password) {
      ToastNotification.error("Please enter your password.");
      return;
    }

    try {
      setLoading(true);
      const response = await loginUser(email, password);
      
      // If we reach here, server returned 200 - user is fully verified and approved
      ToastNotification.success(`Hello, ${response.user.firstName} ${response.user.lastName}`);
      navigate("/home", { replace: true });
      
    } catch (error) {
      if (error.result?.user && error.result?.token) {
        const user = error.result.user;
        
        ToastNotification.success(`Hello, ${user.firstName} ${user.lastName}`);
        
        if (user.email_verification === 0) {
          navigate("/verify-email", { state: { email: user.email }, replace: true });
        } else if (user.librarian_approval === 0) {
          navigate("/librarian-approval", { state: { userEmail: user.email }, replace: true });
        } else {
          navigate("/home", { replace: true });
        }
      } else {
        ToastNotification.error(error.message);
      }
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
        boxSizing: "border-box"
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
          background: rgba(255,255,255,0.95);
          border-radius: 16px;
          box-shadow: 0 8px 32px rgba(44,62,80,0.15);
          padding: 1.5rem;
          width: 100%;
          max-width: 350px;
          backdrop-filter: blur(12px);
          margin: auto;
        }
        .login-title {
          color: ${palette.darkest};
          font-weight: 700;
          font-size: 1.4rem;
          margin-bottom: 0.3rem;
          letter-spacing: 0.5px;
          text-align: center;
        }
        .login-desc {
          color: ${palette.blueGray};
          font-size: 0.9rem;
          margin-bottom: 1.5rem;
          text-align: center;
        }
        .login-label {
          color: ${palette.darkTeal};
          font-size: 0.9rem;
          margin-bottom: 0.3rem;
          font-weight: 500;
          display: block;
        }
        .input-container {
          position: relative;
          margin-bottom: 1rem;
        }
        .login-input {
          width: 100%;
          padding: 0.5rem 0.8rem; /* Reduced padding for smaller height */
          border-radius: 8px;
          border: 1.5px solid ${palette.midTeal};
          background: #f9fbfc;
          color: ${palette.darkest};
          font-size: 1rem;
          outline: none;
          transition: border-color 0.2s;
        }
        .login-input:focus {
          border-color: ${palette.teal};
        }
        .password-input {
          padding-right: 2.5rem; /* Adjusted for smaller input */
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
          margin-bottom: 1rem;
        }
        .login-btn:hover {
          background: linear-gradient(90deg, ${palette.midTeal} 0%, ${palette.teal} 100%);
          transform: translateY(-1px);
        }
        .register-link {
          text-align: center;
          font-size: 0.9rem;
          color: ${palette.blueGray};
          margin-bottom: 0.75rem;
        }
        .register-link a {
          color: ${palette.teal};
          text-decoration: none;
          font-weight: 600;
        }
        .register-link a:hover {
          text-decoration: underline;
        }
        .forgot-password-link {
          text-align: center;
          font-size: 0.85rem;
          color: ${palette.blueGray};
        }
        .forgot-password-link a {
          color: ${palette.teal};
          text-decoration: none;
        }
        .forgot-password-link a:hover {
          text-decoration: underline;
        }
        @media (max-width: 480px) {
          .login-card {
            padding: 1.25rem;
            margin: 0.5rem;
            border-radius: 12px;
          }
          .login-title {
            font-size: 1.3rem;
          }
          .login-desc {
            font-size: 0.85rem;
            margin-bottom: 1.25rem;
          }
          .login-input {
            padding: 0.5rem 0.7rem;
            font-size: 16px; 
          }
          .password-input {
            padding-right: 2.3rem; 
          }
          .password-toggle {
            right: 0.7rem;
            font-size: 1.1rem;
          }
        }
        @media (max-height: 600px) {
          .login-card {
            padding: 1rem;
          }
          .login-title {
            font-size: 1.2rem;
            margin-bottom: 0.2rem;
          }
          .login-desc {
            font-size: 0.8rem;
            margin-bottom: 1rem;
          }
          .input-container {
            margin-bottom: 0.8rem;
          }
          .login-btn {
            margin-bottom: 0.8rem;
          }
        }
        @media (min-width: 768px) {
          .login-card {
            max-width: 500px; 
            padding: 2rem; 
          }
          .login-title {
            font-size: 1.8rem;
          }
          .login-desc {
            font-size: 1rem; 
          }
          .login-input {
            font-size: 1.1rem;
          }
          .login-btn {
            font-size: 1.1rem; 
          }
        }
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
      <form className="login-card" onSubmit={handleSubmit}>
        <div className="login-title">Welcome to Lib-Track!</div>
        <div className="login-desc">Log in to your account</div>
        
        <label className="login-label" htmlFor="email">Email | Student ID | Phone Number</label>
        <div className="input-container">
          <input
            className="login-input"
            type="text"
            id="email"
            autoComplete="username"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
        </div>
        
        <label className="login-label" htmlFor="password">Password</label>
        <div className="input-container">
          <input
            className="login-input password-input"
            type={showPassword ? "text" : "password"}
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          <button
            type="button"
            className="password-toggle"
            onClick={() => setShowPassword(v => !v)}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <IoEyeOffOutline /> : <IoEyeOutline />}
          </button>
        </div>
        
        <button className="login-btn" type="submit" disabled={loading}>
          {loading ? (
            <div className="spinner" style={{
              border: "4px solid rgba(0, 0, 0, 0.1)",
              borderLeftColor: palette.lightBlue,
              borderRadius: "50%",
              width: "20px",
              height: "20px",
              animation: "spin 1s linear infinite",
              margin: "0 auto"
            }}></div>
          ) : (
            "Log In"
          )}
        </button>
        
        <div className="register-link">
          Haven't signed up? <Link to="/register">Register here</Link>
        </div>
        
        <div className="forgot-password-link">
          <Link to="/forgot-password">Forgot your password?</Link>
        </div>
      </form>
    </div>
  );
}
