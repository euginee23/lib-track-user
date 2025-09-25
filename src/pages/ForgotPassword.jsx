import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ToastNotification from "../components/ToastNotification";

const palette = {
  darkest: "#031716",
  darkTeal: "#032F30",
  teal: "#0A7075",
  midTeal: "#0C969C",
  lightBlue: "#6BA3BE",
  blueGray: "#274D60"
};

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      ToastNotification.error("Please enter your email address.");
      return;
    }

    try {
      setLoading(true);
      // TODO: Implement forgot password API call
      ToastNotification.info("Password reset functionality is under development.");
      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (error) {
      ToastNotification.error(error.message);
    } finally {
      setLoading(false);
    }
  };

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
        .forgot-password-card {
          background: rgba(255,255,255,0.95);
          border-radius: 16px;
          box-shadow: 0 8px 32px rgba(44,62,80,0.15);
          padding: 2rem;
          width: 100%;
          max-width: 400px;
          backdrop-filter: blur(12px);
          margin: auto;
        }
        .forgot-password-title {
          color: ${palette.darkest};
          font-weight: 700;
          font-size: 1.5rem;
          margin-bottom: 0.5rem;
          text-align: center;
        }
        .forgot-password-desc {
          color: ${palette.blueGray};
          font-size: 0.9rem;
          margin-bottom: 1.5rem;
          text-align: center;
          line-height: 1.5;
        }
        .forgot-password-input {
          width: 100%;
          padding: 0.75rem;
          border-radius: 8px;
          border: 1.5px solid ${palette.midTeal};
          background: #f9fbfc;
          color: ${palette.darkest};
          font-size: 1rem;
          outline: none;
          transition: border-color 0.2s;
          margin-bottom: 1rem;
        }
        .forgot-password-input:focus {
          border-color: ${palette.teal};
        }
        .forgot-password-btn {
          width: 100%;
          padding: 0.75rem;
          background: linear-gradient(90deg, ${palette.teal} 0%, ${palette.midTeal} 100%);
          color: #fff;
          font-size: 1rem;
          font-weight: 600;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
          margin-bottom: 1rem;
        }
        .forgot-password-btn:hover {
          background: linear-gradient(90deg, ${palette.midTeal} 0%, ${palette.teal} 100%);
          transform: translateY(-1px);
        }
        .back-link {
          text-align: center;
          font-size: 0.9rem;
          color: ${palette.blueGray};
        }
        .back-link a {
          color: ${palette.teal};
          text-decoration: none;
          font-weight: 600;
        }
        .back-link a:hover {
          text-decoration: underline;
        }
      `}</style>
      
      <form className="forgot-password-card" onSubmit={handleSubmit}>
        <h2 className="forgot-password-title">Forgot Password</h2>
        <p className="forgot-password-desc">
          Enter your email address and we'll send you instructions to reset your password.
        </p>
        
        <input
          className="forgot-password-input"
          type="email"
          placeholder="Enter your email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        
        <button 
          className="forgot-password-btn" 
          type="submit" 
          disabled={loading}
        >
          {loading ? "Sending..." : "Send Reset Instructions"}
        </button>
        
        <div className="back-link">
          Remember your password? <a href="/">Back to Login</a>
        </div>
      </form>
    </div>
  );
}