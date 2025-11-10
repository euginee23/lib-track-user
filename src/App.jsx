import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
  useNavigate,
  Navigate,
} from "react-router-dom";
import { useEffect, useState } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Login from './pages/Login';
import Register from "./pages/Register";
import VerifyEmail from "./pages/VerifyEmail";
import LibrarianApproval from "./pages/LibrarianApproval";
import RegisterFingerprint from "./pages/RegisterFingerprint";
import Dashboard from "./pages/Dashboard";
import BookReservation from "./pages/BookReservation";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import ForgotPassword from "./pages/ForgotPassword";
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LoginToKiosk from "./pages/LoginToKiosk";
import ChatbotComponent from "./chatbot/ChatbotComponent.jsx";

import authService from "./utils/auth";

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuth = () => {
    return authService.isAuthenticated();
  };

  useEffect(() => {
    const initializeApp = async () => {
      const isAuth = checkAuth();
      setIsAuthenticated(isAuth);

      // If user is authenticated, refresh their data to get latest verification status
      if (isAuth) {
        await authService.refreshUserData();
      }

      // Only truly public paths that don't require authentication
      const publicPaths = ["/", "/login", "/register", "/forgot-password", "/login-to-kiosk"];
      
      if (!isAuth && !publicPaths.includes(location.pathname)) {
        navigate("/");
      }
      
      setIsLoading(false);
    };

    initializeApp();
  }, [location.pathname, navigate]);

  const handleLogout = () => {
    authService.logoutAndRedirect(navigate);
    setIsAuthenticated(false);
  };

  const ProtectedRoute = ({ children }) => {
    const [shouldRender, setShouldRender] = useState(null);
    
    useEffect(() => {
      const checkAccess = async () => {
        const isAuth = checkAuth();
        if (!isAuth) {
          setShouldRender(<Navigate to="/" replace />);
          return;
        }
        
        // Get fresh user data
        const user = await authService.getUserWithRefresh(true);
        if (!user) {
          setShouldRender(<Navigate to="/" replace />);
          return;
        }

        const isEmailVerified = user.email_verification === 1;
        const isLibrarianApproved = user.librarian_approval === 1;
        const hasFingerprint = user.hasFingerprint === true || user.hasFingerprint === 1;

        if (!isEmailVerified) {
          setShouldRender(<Navigate to="/verify-email" state={{ email: user.email }} replace />);
        } else if (!isLibrarianApproved) {
          setShouldRender(<Navigate to="/librarian-approval" state={{ userEmail: user.email }} replace />);
        } else if (!hasFingerprint) {
          setShouldRender(<Navigate to="/register-fingerprint" state={{ userEmail: user.email }} replace />);
        } else {
          setShouldRender(children);
        }
      };

      checkAccess();
    }, [children]);

    if (shouldRender === null) {
      return (
        <div style={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}>
          <div style={{
            border: "4px solid rgba(255, 255, 255, 0.3)",
            borderLeftColor: "#0C969C",
            borderRadius: "50%",
            width: "40px",
            height: "40px",
            animation: "spin 1s linear infinite"
          }}></div>
        </div>
      );
    }

    return shouldRender;
  };

  const AuthRedirect = ({ children }) => {
    const [shouldRender, setShouldRender] = useState(null);

    useEffect(() => {
      const checkRedirect = async () => {
        const isAuth = checkAuth();
        const currentPath = location.pathname;

        // Allow access to /login-to-kiosk even if authenticated
        if (isAuth && currentPath === "/login-to-kiosk") {
          setShouldRender(children);
          return;
        }

        if (!isAuth) {
          setShouldRender(children);
          return;
        }
        
        // Get fresh user data
        const user = await authService.getUserWithRefresh(true);
        if (!user) {
          setShouldRender(children);
          return;
        }

        const isEmailVerified = user.email_verification === 1;
        const isLibrarianApproved = user.librarian_approval === 1;
        const hasFingerprint = user.hasFingerprint === true || user.hasFingerprint === 1;

        if (!isEmailVerified) {
          setShouldRender(<Navigate to="/verify-email" state={{ email: user.email }} replace />);
        } else if (!isLibrarianApproved) {
          setShouldRender(<Navigate to="/librarian-approval" state={{ userEmail: user.email }} replace />);
        } else if (!hasFingerprint) {
          setShouldRender(<Navigate to="/register-fingerprint" state={{ userEmail: user.email }} replace />);
        } else {
          setShouldRender(<Navigate to="/dashboard" replace />);
        }
      };

      checkRedirect();
    }, [children, location.pathname]);

    if (shouldRender === null) {
      return (
        <div style={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}>
          <div style={{
            border: "4px solid rgba(255, 255, 255, 0.3)",
            borderLeftColor: "#0C969C",
            borderRadius: "50%",
            width: "40px",
            height: "40px",
            animation: "spin 1s linear infinite"
          }}></div>
        </div>
      );
    }

    return shouldRender;
  };

  const VerificationRoute = ({ children }) => {
    const [shouldRender, setShouldRender] = useState(null);
    const [lastPath, setLastPath] = useState("");
    
    useEffect(() => {
      // Reset check when path changes
      if (lastPath !== location.pathname) {
        setLastPath(location.pathname);
        setShouldRender(null);
      }

      // Skip if we've already determined what to render for this path
      if (shouldRender !== null && lastPath === location.pathname) {
        return;
      }

      const checkVerificationAccess = async () => {
        const isAuth = checkAuth();
        if (!isAuth) {
          setShouldRender(<Navigate to="/" replace />);
          return;
        }

        // Get user data without forcing refresh to avoid loops
        const user = await authService.getUserWithRefresh(false);
        if (!user) {
          setShouldRender(<Navigate to="/" replace />);
          return;
        }

        const isEmailVerified = user.email_verification === 1;
        const isLibrarianApproved = user.librarian_approval === 1;
        const hasFingerprint = user.hasFingerprint === true || user.hasFingerprint === 1;
        const currentPath = location.pathname;

        // If everything is already satisfied, go to dashboard
        if (isEmailVerified && isLibrarianApproved && hasFingerprint) {
          setShouldRender(<Navigate to="/dashboard" replace />);
          return;
        }

        // If email not verified, route to verify-email when appropriate
        if (!isEmailVerified) {
          if (currentPath === "/verify-email") {
            setShouldRender(children);
          } else {
            setShouldRender(<Navigate to="/verify-email" state={{ email: user.email }} replace />);
          }
          return;
        }

        // If email verified but librarian approval pending
        if (isEmailVerified && !isLibrarianApproved) {
          if (currentPath === "/librarian-approval") {
            setShouldRender(children);
          } else {
            setShouldRender(<Navigate to="/librarian-approval" state={{ userEmail: user.email }} replace />);
          }
          return;
        }

        // If email verified and approved but missing fingerprint
        if (isEmailVerified && isLibrarianApproved && !hasFingerprint) {
          if (currentPath === "/register-fingerprint") {
            setShouldRender(children);
          } else {
            setShouldRender(<Navigate to="/register-fingerprint" state={{ userEmail: user.email }} replace />);
          }
          return;
        }

        setShouldRender(children);
      };

      checkVerificationAccess();
    }, [children, location.pathname, lastPath, shouldRender]);

    if (shouldRender === null) {
      return (
        <div style={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}>
          <div style={{
            border: "4px solid rgba(255, 255, 255, 0.3)",
            borderLeftColor: "#0C969C",
            borderRadius: "50%",
            width: "40px",
            height: "40px",
            animation: "spin 1s linear infinite"
          }}></div>
        </div>
      );
    }

    return shouldRender;
  };

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div style={{
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #6BA3BE 0%, #0C969C 50%, #0A7075 100%)"
      }}>
        <div style={{
          border: "4px solid rgba(255, 255, 255, 0.3)",
          borderLeftColor: "#fff",
          borderRadius: "50%",
          width: "40px",
          height: "40px",
          animation: "spin 1s linear infinite"
        }}></div>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <>
      <ToastContainer position="top-right" autoClose={2000} />
      <div
        style={{
          position: "fixed",
          zIndex: -1,
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          background: "linear-gradient(135deg, #6BA3BE 0%, #0C969C 50%, #0A7075 100%)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            overflow: "hidden",
          }}
        >
          {/* Animated background elements */}
          <div
            style={{
              position: "absolute",
              top: "-15%",
              left: "-15%",
              width: "500px",
              height: "500px",
              background: "radial-gradient(circle, rgba(107, 163, 190, 0.3) 0%, rgba(107, 163, 190, 0.1) 70%, transparent 100%)",
              borderRadius: "60% 40% 30% 70% / 60% 30% 70% 40%",
              animation: "float 20s ease-in-out infinite",
            }}
          />
          
          <div
            style={{
              position: "absolute",
              top: "60%",
              right: "-20%",
              width: "600px",
              height: "400px",
              background: "radial-gradient(ellipse, rgba(12, 150, 156, 0.25) 0%, rgba(12, 150, 156, 0.08) 70%, transparent 100%)",
              borderRadius: "30% 70% 70% 30% / 30% 40% 60% 70%",
              animation: "float 25s ease-in-out infinite reverse",
            }}
          />
          
          <div
            style={{
              position: "absolute",
              bottom: "-10%",
              left: "20%",
              width: "350px",
              height: "350px",
              background: "radial-gradient(circle, rgba(10, 112, 117, 0.4) 0%, rgba(10, 112, 117, 0.1) 60%, transparent 100%)",
              borderRadius: "70% 30% 50% 50% / 60% 40% 60% 40%",
              animation: "float 18s ease-in-out infinite",
            }}
          />
          
          <div
            style={{
              position: "absolute",
              top: "-20%",
              left: "50%",
              transform: "translateX(-50%)",
              width: "450px",
              height: "450px",
              background: "radial-gradient(circle, rgba(107, 163, 190, 0.2) 0%, rgba(107, 163, 190, 0.05) 65%, transparent 100%)",
              borderRadius: "40% 60% 60% 40% / 70% 30% 70% 30%",
              animation: "float 24s ease-in-out infinite",
            }}
          />
          
          <div
            style={{
              position: "absolute",
              top: "40%",
              left: "-10%",
              width: "380px",
              height: "320px",
              background: "radial-gradient(ellipse, rgba(12, 150, 156, 0.2) 0%, rgba(12, 150, 156, 0.06) 70%, transparent 100%)",
              borderRadius: "50% 50% 60% 40% / 30% 70% 30% 70%",
              animation: "float 22s ease-in-out infinite reverse",
            }}
          />
        </div>
        
        <style>{`
          @keyframes float {
            0%, 100% {
              transform: translateY(0px) rotate(0deg);
            }
            33% {
              transform: translateY(-20px) rotate(2deg);
            }
            66% {
              transform: translateY(10px) rotate(-1deg);
            }
          }
        `}</style>
      </div>
      
      {/* Show Navbar only for authenticated users and exclude verification pages */}
      {isAuthenticated &&
        !["/", "/login", "/register", "/verify-email", "/librarian-approval", "/register-fingerprint", "/forgot-password"].includes(location.pathname) && (
          <Navbar onLogout={handleLogout} />
        )}

      {/* App Routes */}
      <div className="container-fluid" style={{ fontSize: "0.95rem", minHeight: "100vh" }}>
        <Routes>
          <Route
            path="/"
            element={
              <AuthRedirect>
                <Login />
              </AuthRedirect>
            }
          />
          <Route
            path="/login"
            element={
              <AuthRedirect>
                <Login />
              </AuthRedirect>
            }
          />
          <Route
            path="/register"
            element={
              <AuthRedirect>
                <Register />
              </AuthRedirect>
            }
          />
          <Route
            path="/verify-email"
            element={
              <VerificationRoute>
                <VerifyEmail />
              </VerificationRoute>
            }
          />
          <Route
            path="/librarian-approval"
            element={
              <VerificationRoute>
                <LibrarianApproval />
              </VerificationRoute>
            }
          />
          <Route
            path="/register-fingerprint"
            element={
              <VerificationRoute>
                <RegisterFingerprint />
              </VerificationRoute>
            }
          />
          <Route
            path="/forgot-password"
            element={
              <AuthRedirect>
                <ForgotPassword />
              </AuthRedirect>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/book-reservation"
            element={
              <ProtectedRoute>
                <BookReservation />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/login-to-kiosk"
            element={
              <AuthRedirect>
                <LoginToKiosk />
              </AuthRedirect>
            }
          />
          {/* 404 NOT FOUND */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
      
      {/* Show Footer on all screens */}
      <Footer />
      
      {/* Add padding to prevent content from being hidden under the footer */}
      <div style={{ paddingBottom: '3rem' }}></div>
      
      {/* Show Chatbot only for authenticated users and exclude verification pages */}
      {isAuthenticated &&
        !["/", "/login", "/register", "/verify-email", "/librarian-approval", "/register-fingerprint", "/forgot-password"].includes(location.pathname) && (
          <ChatbotComponent />
        )}
    </>
  );
}

export default function AppWrapper() {
  return (
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
}
