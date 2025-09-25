import React from "react";
import ToastNotification from "../components/ToastNotification";

const palette = {
  darkest: "#031716",
  darkTeal: "#032F30",
  teal: "#0A7075",
  midTeal: "#0C969C",
  lightBlue: "#6BA3BE",
  blueGray: "#274D60"
};

export default function Dashboard() {
  ToastNotification.info("Welcome to the Dashboard!");
  
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
            <h2 className="mb-3" style={{ color: palette.darkest }}>Dashboard</h2>
            <p className="lead mb-4" style={{ color: palette.blueGray }}>
              Quick stats and activity overview.
            </p>
            
            <div className="row g-4">
              <div className="col-md-6 col-lg-3">
                <div className="card border-0 text-center" style={{ 
                  backgroundColor: 'rgba(107, 163, 190, 0.1)',
                  borderRadius: '10px'
                }}>
                  <div className="card-body">
                    <div className="h2" style={{ color: palette.teal }}>0</div>
                    <h6 style={{ color: palette.blueGray }}>Books Borrowed</h6>
                  </div>
                </div>
              </div>
              
              <div className="col-md-6 col-lg-3">
                <div className="card border-0 text-center" style={{ 
                  backgroundColor: 'rgba(12, 150, 156, 0.1)',
                  borderRadius: '10px'
                }}>
                  <div className="card-body">
                    <div className="h2" style={{ color: palette.midTeal }}>0</div>
                    <h6 style={{ color: palette.blueGray }}>Overdue Items</h6>
                  </div>
                </div>
              </div>
              
              <div className="col-md-6 col-lg-3">
                <div className="card border-0 text-center" style={{ 
                  backgroundColor: 'rgba(10, 112, 117, 0.1)',
                  borderRadius: '10px'
                }}>
                  <div className="card-body">
                    <div className="h2" style={{ color: palette.teal }}>0</div>
                    <h6 style={{ color: palette.blueGray }}>Reservations</h6>
                  </div>
                </div>
              </div>
              
              <div className="col-md-6 col-lg-3">
                <div className="card border-0 text-center" style={{ 
                  backgroundColor: 'rgba(39, 77, 96, 0.1)',
                  borderRadius: '10px'
                }}>
                  <div className="card-body">
                    <div className="h2" style={{ color: palette.blueGray }}>0</div>
                    <h6 style={{ color: palette.blueGray }}>History</h6>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-4">
              <h5 style={{ color: palette.darkTeal }}>Recent Activity</h5>
              <div className="alert alert-info" style={{ 
                backgroundColor: 'rgba(107, 163, 190, 0.1)',
                borderColor: palette.lightBlue,
                color: palette.blueGray
              }}>
                No recent activity to display.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}