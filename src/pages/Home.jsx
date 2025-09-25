import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ToastNotification from "../components/ToastNotification";
import authService from "../utils/auth";

const palette = {
  darkest: "#031716",
  darkTeal: "#032F30",
  teal: "#0A7075",
  midTeal: "#0C969C",
  lightBlue: "#6BA3BE",
  blueGray: "#274D60"
};

export default function Home() {
  const navigate = useNavigate();

  useEffect(() => {
    // Prevent navigation back to verification screens when fully authenticated
    if (authService.isAuthenticated()) {
      const user = authService.getUser();
      if (user && user.email_verified === 1 && user.librarian_approval === 1) {
        const handlePopState = (event) => {
          const currentPath = window.location.pathname;
          if (currentPath === "/verify-email" || currentPath === "/librarian-approval" || currentPath === "/login" || currentPath === "/register") {
            event.preventDefault();
            window.history.pushState(null, null, "/home");
          }
        };
        
        window.addEventListener("popstate", handlePopState);
        
        return () => {
          window.removeEventListener("popstate", handlePopState);
        };
      }
    }
  }, []);

  useEffect(() => {
    ToastNotification.info("Welcome to your Library Home!");
  }, []);
  
  return (
    <div className="container py-4">
      <div className="row">
        <div className="col-12">
          <div className="card shadow-lg p-4" style={{ 
            backgroundColor: 'rgba(255, 255, 255, 0.95)', 
            border: 'none',
            borderRadius: '12px',
            backdropFilter: 'blur(10px)'
          }}>
            <h2 className="mb-3" style={{ color: palette.darkest }}>
              Welcome to Library Tracker
            </h2>
            <p className="lead" style={{ color: palette.blueGray }}>
              Your gateway to managing library resources efficiently.
            </p>
            
            <div className="row g-4 mt-3">
              <div className="col-md-6 col-lg-3">
                <div className="card border-0 h-100" style={{ 
                  backgroundColor: 'rgba(107, 163, 190, 0.1)',
                  borderRadius: '10px'
                }}>
                  <div className="card-body text-center">
                    <h5 style={{ color: palette.teal }}>Quick Search</h5>
                    <p className="small" style={{ color: palette.blueGray }}>
                      Find books and resources instantly
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="col-md-6 col-lg-3">
                <div className="card border-0 h-100" style={{ 
                  backgroundColor: 'rgba(12, 150, 156, 0.1)',
                  borderRadius: '10px'
                }}>
                  <div className="card-body text-center">
                    <h5 style={{ color: palette.midTeal }}>My Books</h5>
                    <p className="small" style={{ color: palette.blueGray }}>
                      Track your borrowed items
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="col-md-6 col-lg-3">
                <div className="card border-0 h-100" style={{ 
                  backgroundColor: 'rgba(10, 112, 117, 0.1)',
                  borderRadius: '10px'
                }}>
                  <div className="card-body text-center">
                    <h5 style={{ color: palette.teal }}>Dashboard</h5>
                    <p className="small" style={{ color: palette.blueGray }}>
                      View your activity summary
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="col-md-6 col-lg-3">
                <div className="card border-0 h-100" style={{ 
                  backgroundColor: 'rgba(39, 77, 96, 0.1)',
                  borderRadius: '10px'
                }}>
                  <div className="card-body text-center">
                    <h5 style={{ color: palette.blueGray }}>Profile</h5>
                    <p className="small" style={{ color: palette.blueGray }}>
                      Manage your account settings
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}