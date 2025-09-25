import React from "react";
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

export default function Profile() {
  ToastNotification.info("Manage your profile settings.");
  
  const user = authService.getUser();
  
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
            <h2 className="mb-3" style={{ color: palette.darkest }}>Profile Settings</h2>
            <p className="small mb-4" style={{ color: palette.blueGray }}>Manage your account information and preferences.</p>
            
            {user && (
              <div className="row">
                <div className="col-md-6">
                  <div className="card border-0" style={{ 
                    backgroundColor: 'rgba(107, 163, 190, 0.1)',
                    borderRadius: '10px'
                  }}>
                    <div className="card-body">
                      <h5 style={{ color: palette.teal }}>Account Information</h5>
                      <p className="mb-2"><strong>Name:</strong> {user.firstName} {user.lastName}</p>
                      <p className="mb-2"><strong>Email:</strong> {user.email}</p>
                      <p className="mb-2"><strong>Student ID:</strong> {user.studentId || 'N/A'}</p>
                      <p className="mb-0"><strong>Status:</strong> {user.isApproved ? 'Approved' : 'Pending'}</p>
                    </div>
                  </div>
                </div>
                
                <div className="col-md-6">
                  <div className="card border-0" style={{ 
                    backgroundColor: 'rgba(12, 150, 156, 0.1)',
                    borderRadius: '10px'
                  }}>
                    <div className="card-body">
                      <h5 style={{ color: palette.midTeal }}>Quick Actions</h5>
                      <button 
                        className="btn btn-sm mb-2 d-block"
                        style={{
                          backgroundColor: palette.teal,
                          color: 'white',
                          borderColor: palette.teal
                        }}
                      >
                        Update Password
                      </button>
                      <button 
                        className="btn btn-sm d-block"
                        style={{
                          backgroundColor: 'transparent',
                          color: palette.teal,
                          borderColor: palette.teal
                        }}
                      >
                        Edit Profile
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}