import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { requestEmailVerification } from "../../api/login/user_emailVerification";
import { verifyEmailCode } from "../../api/login/user_emailVerifyCode";
import ToastNotification from "../components/ToastNotification";

const palette = {
  darkest: "#031716",
  darkTeal: "#032F30",
  teal: "#0A7075",
  midTeal: "#0C969C",
  lightBlue: "#6BA3BE",
  blueGray: "#274D60"
};

export default function VerifyEmail() {
  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [showCodeInput, setShowCodeInput] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Get email from navigation state if passed from login
    if (location.state?.email) {
      setEmail(location.state.email);
    }
  }, [location.state]);

  // Cooldown timer effect
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  async function handleSendVerification(e) {
    e.preventDefault();

    if (!email) {
      ToastNotification.error("Please enter your email.");
      return;
    }

    if (cooldown > 0) {
      ToastNotification.warning(`Please wait ${cooldown} seconds before requesting another code.`);
      return;
    }

    try {
      setLoading(true);
      const result = await requestEmailVerification(email);
      ToastNotification.success("Verification code sent to your email!");
      setShowCodeInput(true);
      setCooldown(30); // 30 second cooldown
    } catch (error) {
      ToastNotification.error(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyCode(e) {
    e.preventDefault();

    if (!verificationCode) {
      ToastNotification.error("Please enter the verification code.");
      return;
    }

    if (verificationCode.length !== 6) {
      ToastNotification.error("Verification code must be 6 digits.");
      return;
    }

    try {
      setLoading(true);
      const result = await verifyEmailCode(email, verificationCode);
      
      ToastNotification.success("Email verified successfully!");
      
      // CHECK LIBRARIAN APPROVAL STATUS TO DETERMINE REDIRECT
      if (result.librarian_approval === 1) {
        // USER IS APPROVED, REDIRECT TO DASHBOARD
        navigate("/dashboard");
      } else {
        // USER STILL NEEDS LIBRARIAN APPROVAL
        navigate("/librarian-approval", { state: { userEmail: email } });
      }
      
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
        .verify-card {
          background: rgba(255,255,255,0.95);
          border-radius: 16px;
          box-shadow: 0 8px 32px rgba(44,62,80,0.15);
          padding: 1.5rem;
          width: 100%;
          max-width: 350px;
          backdrop-filter: blur(12px);
          margin: auto;
        }
        .verify-title {
          color: ${palette.darkest};
          font-weight: 700;
          font-size: 1.4rem;
          margin-bottom: 0.3rem;
          letter-spacing: 0.5px;
          text-align: center;
        }
        .verify-desc {
          color: ${palette.blueGray};
          font-size: 0.9rem;
          margin-bottom: 1.5rem;
          text-align: center;
        }
        .verify-label {
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
        .verify-input {
          width: 100%;
          padding: 0.5rem 0.8rem;
          border-radius: 8px;
          border: 1.5px solid ${palette.midTeal};
          background: #f9fbfc;
          color: ${palette.darkest};
          font-size: 1rem;
          outline: none;
          transition: border-color 0.2s;
        }
        .verify-input:focus {
          border-color: ${palette.teal};
        }
        .verify-btn {
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
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .verify-btn:hover {
          background: linear-gradient(90deg, ${palette.midTeal} 0%, ${palette.teal} 100%);
          transform: translateY(-1px);
        }
        .spinner {
          border: 4px solid rgba(0, 0, 0, 0.1);
          border-left-color: ${palette.lightBlue};
          border-radius: 50%;
          width: 24px;
          height: 24px;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
      <form className="verify-card" onSubmit={showCodeInput ? handleVerifyCode : handleSendVerification}>
        <div className="verify-title">Verify Your Email</div>
        <div className="verify-desc">
          {showCodeInput 
            ? "Enter the 6-digit code sent to your email" 
            : "We'll send a verification code to your email"
          }
        </div>

        <label className="verify-label" htmlFor="email">Email</label>
        <div className="input-container">
          <input
            className="verify-input"
            type="email"
            id="email"
            autoComplete="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            readOnly
          />
        </div>

        {showCodeInput && (
          <>
            <label className="verify-label" htmlFor="code">Verification Code</label>
            <div className="input-container">
              <input
                className="verify-input"
                type="text"
                id="code"
                placeholder="Enter 6-digit code"
                value={verificationCode}
                onChange={e => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                maxLength="6"
                required
              />
            </div>
          </>
        )}

        <button className="verify-btn" type="submit" disabled={loading || (cooldown > 0 && !showCodeInput)}>
          {loading ? (
            <div className="spinner"></div>
          ) : showCodeInput ? (
            "Verify Code"
          ) : cooldown > 0 ? (
            `Wait ${cooldown}s`
          ) : (
            "Send Verification Code"
          )}
        </button>

        {showCodeInput && (
          <button
            type="button"
            className="verify-btn"
            style={{ 
              background: cooldown > 0 ? palette.blueGray : `linear-gradient(90deg, ${palette.teal} 0%, ${palette.midTeal} 100%)`,
              opacity: cooldown > 0 ? 0.6 : 1,
              cursor: cooldown > 0 ? 'not-allowed' : 'pointer'
            }}
            onClick={handleSendVerification}
            disabled={cooldown > 0}
          >
            {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend Code"}
          </button>
        )}

        <button
          type="button"
          className="verify-btn"
          style={{ background: palette.blueGray, marginTop: "0.5rem" }}
          onClick={() => navigate("/login")}
        >
          Log Out
        </button>
      </form>
    </div>
  );
}