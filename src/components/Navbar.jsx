import { useState, useEffect, useRef } from "react";
import { FaBars } from 'react-icons/fa';

export default function Navbar() {
  const dropdownRef = useRef(null);
  const btnRef = useRef(null);
  const [show, setShow] = useState(false);

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

  return (
    <nav className="navbar navbar-expand-lg navbar-dark px-2 py-1 shadow-sm" style={{ backgroundColor: '#032F30', position: 'relative' }}>
      <div className="container-fluid">
        <span className="navbar-brand mb-0 h1" style={{ fontSize: '0.9rem', color: 'white' }}>Lib-Track</span>
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
        <ul
          ref={dropdownRef}
          className={`dropdown-menu dropdown-menu-end${show ? ' show' : ''}`}
          style={{ minWidth: '140px', padding: '8px', background: 'rgba(255,255,255,0.95)', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.10)', border: 'none', position: 'absolute', right: 0, top: '48px', zIndex: 100, display: show ? 'block' : 'none' }}
        >
          <li>
            <a className="dropdown-item" href="/dashboard" style={{ fontSize: '0.85rem', color: '#031716', borderRadius: '6px', marginBottom: '4px', padding: '6px 12px' }}>Dashboard</a>
          </li>
          <li>
            <a className="dropdown-item" href="/search-books" style={{ fontSize: '0.85rem', color: '#031716', borderRadius: '6px', marginBottom: '4px', padding: '6px 12px' }}>Search</a>
          </li>
          <li>
            <a className="dropdown-item" href="/my-borrowed" style={{ fontSize: '0.85rem', color: '#031716', borderRadius: '6px', marginBottom: '4px', padding: '6px 12px' }}>Borrowed</a>
          </li>
          <li>
            <a className="dropdown-item" href="/profile" style={{ fontSize: '0.85rem', color: '#031716', borderRadius: '6px', padding: '6px 12px' }}>Profile</a>
          </li>
        </ul>
      </div>
    </nav>
  );
}
