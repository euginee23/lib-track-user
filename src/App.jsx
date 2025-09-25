import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from './pages/Login';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Register from "./pages/Register";
import ToastNotification from "./components/ToastNotification";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { useLocation } from 'react-router-dom';


// Placeholder pages
function Dashboard() {
  ToastNotification.info("Welcome to the Dashboard!");
  return (
    <div className="card shadow-lg p-4" style={{ 
      backgroundColor: 'rgba(255, 255, 255, 0.95)', 
      border: 'none',
      borderRadius: '12px',
      backdropFilter: 'blur(10px)'
    }}>
      <h5 className="mb-3" style={{ color: '#031716' }}>Dashboard</h5>
      <p className="small" style={{ color: '#274D60' }}>Quick stats and activity overview.</p>
    </div>
  );
}
function SearchBooks() {
  ToastNotification.info("Search for books in the library.");
  return (
    <div className="card shadow-lg p-4" style={{ 
      backgroundColor: 'rgba(255, 255, 255, 0.95)', 
      border: 'none',
      borderRadius: '12px',
      backdropFilter: 'blur(10px)'
    }}>
      <h5 className="mb-3" style={{ color: '#031716' }}>Search Books</h5>
      <p className="small" style={{ color: '#274D60' }}>Find books in the library.</p>
    </div>
  );
}
function MyBorrowed() {
  ToastNotification.info("View your borrowed books.");
  return (
    <div className="card shadow-lg p-4" style={{ 
      backgroundColor: 'rgba(255, 255, 255, 0.95)', 
      border: 'none',
      borderRadius: '12px',
      backdropFilter: 'blur(10px)'
    }}>
      <h5 className="mb-3" style={{ color: '#031716' }}>Borrowed Books</h5>
      <p className="small" style={{ color: '#274D60' }}>Books you have borrowed.</p>
    </div>
  );
}
function Profile() {
  ToastNotification.info("Manage your profile settings.");
  return (
    <div className="card shadow-lg p-4" style={{ 
      backgroundColor: 'rgba(255, 255, 255, 0.95)', 
      border: 'none',
      borderRadius: '12px',
      backdropFilter: 'blur(10px)'
    }}>
      <h5 className="mb-3" style={{ color: '#031716' }}>Profile</h5>
      <p className="small" style={{ color: '#274D60' }}>Manage your profile settings.</p>
    </div>
  );
}

function AppContent() {
  const location = useLocation();
  const hideNavbarPaths = ['/login', '/register', '*'];

  return (
    <div className="min-vh-100 d-flex flex-column" style={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #6BA3BE 0%, #0C969C 50%, #0A7075 100%)'
    }}>
      {!hideNavbarPaths.includes(location.pathname) && <Navbar />}
      <div className="flex-grow-1 d-flex flex-column">
        <main className="container py-3 flex-grow-1">
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/search-books" element={<SearchBooks />} />
            <Route path="/my-borrowed" element={<MyBorrowed />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/login" element={<Login />} />
            <Route path="*" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Routes>
        </main>
      </div>
      <Footer />
      <ToastContainer />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
