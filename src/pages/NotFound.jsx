import React from "react";
import { Link } from "react-router-dom";

const palette = {
  darkest: "#031716",
  darkTeal: "#032F30",
  teal: "#0A7075",
  midTeal: "#0C969C",
  lightBlue: "#6BA3BE",
  blueGray: "#274D60"
};

export default function NotFound() {
  return (
    <div 
      className="d-flex align-items-center justify-content-center"
      style={{ 
        minHeight: "80vh",
        background: `linear-gradient(135deg, ${palette.lightBlue} 0%, ${palette.midTeal} 50%, ${palette.teal} 100%)`
      }}
    >
      <div className="text-center">
        <div className="card shadow-lg p-5" style={{ 
          backgroundColor: 'rgba(255, 255, 255, 0.95)', 
          border: 'none',
          borderRadius: '16px',
          backdropFilter: 'blur(10px)',
          maxWidth: '500px'
        }}>
          <h1 className="display-1 fw-bold" style={{ color: palette.teal }}>404</h1>
          <h2 className="mb-3" style={{ color: palette.darkest }}>Page Not Found</h2>
          <p className="mb-4" style={{ color: palette.blueGray }}>
            The page you are looking for doesn't exist or has been moved.
          </p>
          <Link 
            to="/home" 
            className="btn btn-lg"
            style={{
              backgroundColor: palette.teal,
              color: 'white',
              borderColor: palette.teal,
              textDecoration: 'none'
            }}
          >
            Go Back Home
          </Link>
        </div>
      </div>
    </div>
  );
}