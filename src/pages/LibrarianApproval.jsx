import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import authService from "../utils/auth";

const palette = {
  darkest: "#031716",
  darkTeal: "#032F30",
  teal: "#0A7075",
  midTeal: "#0C969C",
  lightBlue: "#6BA3BE",
  blueGray: "#274D60"
};

export default function LibrarianApproval() {
  const navigate = useNavigate();
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    // Prevent navigation back to login/register when authenticated
    if (authService.isAuthenticated()) {
      const handlePopState = (event) => {
        event.preventDefault();
        // Stay on current page
        window.history.pushState(null, null, "/librarian-approval");
      };
      
      // Prevent back button
      window.history.pushState(null, null, "/librarian-approval");
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

  // Function to check approval status (could be called periodically or on refresh)
  function checkApprovalStatus() {
    const user = authService.getUser();
    if (user) {
      const isEmailVerified = user.email_verifcation === 1;
      const isLibrarianApproved = user.librarian_approval === 1;
      
      if (!isEmailVerified) {
        // If email verification was revoked, redirect back to email verification
        navigate("/verify-email", { state: { email: user.email }, replace: true });
      } else if (isLibrarianApproved) {
        // If approved, redirect to home
        navigate("/home", { replace: true });
      }
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
        .approval-card {
          background: rgba(255,255,255,0.95);
          border-radius: 16px;
          box-shadow: 0 8px 32px rgba(44,62,80,0.15);
          padding: 1.5rem;
          width: 100%;
          max-width: 350px;
          backdrop-filter: blur(12px);
          margin: auto;
          text-align: center;
        }
        .approval-title {
          color: ${palette.darkest};
          font-weight: 700;
          font-size: 1.4rem;
          margin-bottom: 0.3rem;
          letter-spacing: 0.5px;
        }
        .approval-desc {
          color: ${palette.blueGray};
          font-size: 0.9rem;
          margin-bottom: 1.5rem;
          line-height: 1.5;
        }
        .user-email {
          color: ${palette.teal};
          font-weight: 600;
          font-size: 0.9rem;
          margin-bottom: 1.5rem;
          padding: 0.75rem;
          background: rgba(10, 112, 117, 0.1);
          border-radius: 8px;
          border: 1px solid rgba(10, 112, 117, 0.2);
        }
        .action-buttons {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .refresh-btn {
          width: 100%;
          padding: 0.75rem 0;
          background: linear-gradient(90deg, ${palette.midTeal} 0%, ${palette.lightBlue} 100%);
          color: #fff;
          font-size: 1rem;
          font-weight: 600;
          border: none;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(44,62,80,0.10);
          cursor: pointer;
          transition: all 0.2s;
        }
        .refresh-btn:hover {
          background: linear-gradient(90deg, ${palette.lightBlue} 0%, ${palette.midTeal} 100%);
          transform: translateY(-1px);
        }
        .logout-btn {
          width: 100%;
          padding: 0.75rem 0;
          background: ${palette.blueGray};
          color: #fff;
          font-size: 1rem;
          font-weight: 600;
          border: none;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(44,62,80,0.10);
          cursor: pointer;
          transition: all 0.2s;
        }
        .logout-btn:hover {
          background: ${palette.darkTeal};
          transform: translateY(-1px);
        }
        .status-info {
          background: rgba(107, 163, 190, 0.1);
          border: 1px solid rgba(107, 163, 190, 0.2);
          border-radius: 8px;
          padding: 1rem;
          margin-bottom: 1.5rem;
        }
        .status-title {
          color: ${palette.darkTeal};
          font-weight: 600;
          font-size: 0.9rem;
          margin-bottom: 0.5rem;
        }
        .status-desc {
          color: ${palette.blueGray};
          font-size: 0.8rem;
          line-height: 1.4;
        }
      `}</style>
      <div className="approval-card">
        <div className="approval-title">Account Pending Approval</div>
        <div className="approval-desc">
          Your account has been created and email verified successfully. Please wait for librarian approval to access the library system.
        </div>

        {userEmail && (
          <div className="user-email">
            Account: {userEmail}
          </div>
        )}

        <div className="status-info">
          <div className="status-title">Current Status</div>
          <div className="status-desc">
            ✅ Email Verified<br/>
            ⏳ Awaiting Librarian Approval
          </div>
        </div>

        <div className="action-buttons">
          <button className="refresh-btn" onClick={checkApprovalStatus}>
            Check Approval Status
          </button>
          <button className="logout-btn" onClick={handleLogout}>
            Log Out
          </button>
        </div>
      </div>
    </div>
  );
}