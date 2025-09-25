import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { FaBars, FaSignOutAlt } from 'react-icons/fa';
import authService from "../utils/auth";

export default function Navbar({ onLogout }) {
  const dropdownRef = useRef(null);
  const btnRef = useRef(null);
  const [show, setShow] = useState(false);
  
  const user = authService.getUser();

  useEffect(() => {
    function handleClick(e) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target) &&
        btnRef.current &&
        !btnRef.current.contains(e.target)
      ) {
        setShow(false);
      }
    }
    if (show) {
      document.addEventListener('mousedown', handleClick);
    } else {
      document.removeEventListener('mousedown', handleClick);
    }
    return () => document.removeEventListener('mousedown', handleClick);
  }, [show]);

  const handleLogout = () => {
    setShow(false);
    if (onLogout) {
      onLogout();
    }
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark px-2 py-1 shadow-sm" style={{ backgroundColor: '#032F30', position: 'relative' }}>
      <div className="container-fluid">
        <Link to="/home" className="navbar-brand mb-0 h1" style={{ fontSize: '0.9rem', color: 'white', textDecoration: 'none' }}>
          Lib-Track
        </Link>
        <div className="d-flex align-items-center">
          {user && (
            <span className="text-white me-2 d-none d-md-inline" style={{ fontSize: '0.8rem' }}>
              Welcome, {user.firstName}
            </span>
          )}
          <button
            ref={btnRef}
            className="navbar-toggler d-flex align-items-center justify-content-center"
            type="button"
            aria-expanded={show}
            style={{ width: '36px', height: '36px', padding: 0, backgroundColor: '#0A7075', borderRadius: '10%', border: '1px solid #031716', boxShadow: '0 1px 4px rgba(0,0,0,0.12)' }}
            onClick={() => setShow((v) => !v)}
          >
            <FaBars style={{ color: 'white', fontSize: '1.2rem' }} />
          </button>
        </div>
        <ul
          ref={dropdownRef}
          className={`dropdown-menu dropdown-menu-end${show ? ' show' : ''}`}
          style={{ minWidth: '140px', padding: '8px', background: 'rgba(255,255,255,0.95)', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.10)', border: 'none', position: 'absolute', right: 0, top: '48px', zIndex: 100, display: show ? 'block' : 'none' }}
        >
          <li>
            <Link 
              to="/home" 
              className="dropdown-item" 
              style={{ fontSize: '0.85rem', color: '#031716', borderRadius: '6px', marginBottom: '4px', padding: '6px 12px', textDecoration: 'none' }}
              onClick={() => setShow(false)}
            >
              Home
            </Link>
          </li>
          <li>
            <Link 
              to="/dashboard" 
              className="dropdown-item" 
              style={{ fontSize: '0.85rem', color: '#031716', borderRadius: '6px', marginBottom: '4px', padding: '6px 12px', textDecoration: 'none' }}
              onClick={() => setShow(false)}
            >
              Dashboard
            </Link>
          </li>
          <li>
            <Link 
              to="/search-books" 
              className="dropdown-item" 
              style={{ fontSize: '0.85rem', color: '#031716', borderRadius: '6px', marginBottom: '4px', padding: '6px 12px', textDecoration: 'none' }}
              onClick={() => setShow(false)}
            >
              Search Books
            </Link>
          </li>
          <li>
            <Link 
              to="/my-borrowed" 
              className="dropdown-item" 
              style={{ fontSize: '0.85rem', color: '#031716', borderRadius: '6px', marginBottom: '4px', padding: '6px 12px', textDecoration: 'none' }}
              onClick={() => setShow(false)}
            >
              My Borrowed
            </Link>
          </li>
          <li>
            <Link 
              to="/profile" 
              className="dropdown-item" 
              style={{ fontSize: '0.85rem', color: '#031716', borderRadius: '6px', marginBottom: '4px', padding: '6px 12px', textDecoration: 'none' }}
              onClick={() => setShow(false)}
            >
              Profile
            </Link>
          </li>
          <li><hr className="dropdown-divider" style={{ margin: '4px 0' }} /></li>
          <li>
            <button 
              className="dropdown-item d-flex align-items-center" 
              style={{ fontSize: '0.85rem', color: '#dc3545', borderRadius: '6px', padding: '6px 12px', background: 'none', border: 'none', width: '100%', textAlign: 'left' }}
              onClick={handleLogout}
            >
              <FaSignOutAlt className="me-2" />
              Logout
            </button>
          </li>
        </ul>
      </div>
    </nav>
  );
}
