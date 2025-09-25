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

export default function SearchBooks() {
  ToastNotification.info("Search for books in the library.");
  
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
            <h2 className="mb-3" style={{ color: palette.darkest }}>Search Books</h2>
            <p className="small mb-4" style={{ color: palette.blueGray }}>Find books in the library collection.</p>
            
            <div className="row">
              <div className="col-md-8">
                <div className="input-group mb-3">
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="Search by title, author, or ISBN..."
                    style={{
                      borderColor: palette.midTeal,
                      backgroundColor: 'rgba(255, 255, 255, 0.9)'
                    }}
                  />
                  <button 
                    className="btn" 
                    type="button"
                    style={{
                      backgroundColor: palette.teal,
                      color: 'white',
                      borderColor: palette.teal
                    }}
                  >
                    Search
                  </button>
                </div>
              </div>
            </div>
            
            <div className="alert alert-info" style={{ 
              backgroundColor: 'rgba(107, 163, 190, 0.1)',
              borderColor: palette.lightBlue,
              color: palette.blueGray
            }}>
              <strong>Coming Soon:</strong> Advanced search functionality is under development.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}