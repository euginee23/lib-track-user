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

export default function MyBorrowed() {
  ToastNotification.info("View your borrowed books.");
  
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
            <h2 className="mb-3" style={{ color: palette.darkest }}>My Borrowed Books</h2>
            <p className="small mb-4" style={{ color: palette.blueGray }}>Books you have currently borrowed from the library.</p>
            
            <div className="alert alert-info" style={{ 
              backgroundColor: 'rgba(107, 163, 190, 0.1)',
              borderColor: palette.lightBlue,
              color: palette.blueGray
            }}>
              <strong>No borrowed books found.</strong> You haven't borrowed any books yet.
            </div>
            
            <div className="text-center mt-4">
              <button 
                className="btn"
                style={{
                  backgroundColor: palette.teal,
                  color: 'white',
                  borderColor: palette.teal
                }}
              >
                Browse Available Books
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}