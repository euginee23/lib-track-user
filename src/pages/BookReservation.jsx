import React, { useState, useEffect } from 'react';
import { FaBook, FaClock, FaCalendarAlt, FaEnvelope, FaBell, FaTrash, FaEye, FaSearch, FaFilter, FaArrowLeft, FaStar, FaMapMarkerAlt, FaUsers, FaCheckCircle, FaTimes, FaChevronRight, FaHeart, FaBookmark } from 'react-icons/fa';

function BookReservation() {
  const [activeTab, setActiveTab] = useState('available');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [myReservations, setMyReservations] = useState([]);
  const [availableBooks, setAvailableBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Mock data for available books with expected return dates and realistic book covers
  const mockAvailableBooks = [
    {
      id: 1,
      title: "Introduction to Computer Science",
      author: "John Smith",
      isbn: "978-0123456789",
      category: "Computer Science",
      currentBorrower: "Jane Doe",
      expectedReturnDate: "2025-10-15",
      daysUntilReturn: 8,
      reservationCount: 2,
      canReserve: true,
      rating: 4.6,
      totalReviews: 234,
      location: "3rd Floor - Computer Science Section",
      coverImage: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=600&fit=crop&crop=entropy&auto=format&fm=webp&q=80"
    },
    {
      id: 2,
      title: "Advanced Mathematics",
      author: "Mary Johnson",
      isbn: "978-0987654321",
      category: "Mathematics",
      currentBorrower: "Mike Wilson",
      expectedReturnDate: "2025-10-12",
      daysUntilReturn: 5,
      reservationCount: 0,
      canReserve: true,
      rating: 4.8,
      totalReviews: 189,
      location: "2nd Floor - Mathematics Section",
      coverImage: "https://images.unsplash.com/photo-1635372722656-389f87a941b7?w=400&h=600&fit=crop&crop=entropy&auto=format&fm=webp&q=80"
    },
    {
      id: 3,
      title: "Database Management Systems",
      author: "Robert Brown",
      isbn: "978-0456789123",
      category: "Computer Science",
      currentBorrower: "Sarah Davis",
      expectedReturnDate: "2025-10-20",
      daysUntilReturn: 13,
      reservationCount: 1,
      canReserve: true,
      rating: 4.5,
      totalReviews: 167,
      location: "3rd Floor - Computer Science Section",
      coverImage: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=600&fit=crop&crop=entropy&auto=format&fm=webp&q=80"
    },
    {
      id: 4,
      title: "Data Structures and Algorithms",
      author: "Thomas Anderson",
      isbn: "978-0321573513",
      category: "Computer Science",
      currentBorrower: "Emily Chen",
      expectedReturnDate: "2025-10-18",
      daysUntilReturn: 11,
      reservationCount: 3,
      canReserve: true,
      rating: 4.9,
      totalReviews: 412,
      location: "3rd Floor - Computer Science Section",
      coverImage: "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400&h=600&fit=crop&crop=entropy&auto=format&fm=webp&q=80"
    },
    {
      id: 5,
      title: "Web Development Fundamentals",
      author: "Sarah Wilson",
      isbn: "978-0789456123",
      category: "Computer Science",
      currentBorrower: "Alex Johnson",
      expectedReturnDate: "2025-10-25",
      daysUntilReturn: 18,
      reservationCount: 1,
      canReserve: true,
      rating: 4.7,
      totalReviews: 156,
      location: "3rd Floor - Computer Science Section",
      coverImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop&crop=entropy&auto=format&fm=webp&q=80"
    },
    {
      id: 6,
      title: "Linear Algebra and Its Applications",
      author: "David Gilbert",
      isbn: "978-0321885678",
      category: "Mathematics",
      currentBorrower: "Maria Rodriguez",
      expectedReturnDate: "2025-10-14",
      daysUntilReturn: 7,
      reservationCount: 0,
      canReserve: true,
      rating: 4.4,
      totalReviews: 298,
      location: "2nd Floor - Mathematics Section",
      coverImage: "https://images.unsplash.com/photo-1596495578065-6e0763fa1178?w=400&h=600&fit=crop&crop=entropy&auto=format&fm=webp&q=80"
    }
  ];

  // Mock data for user's reservations
  const mockReservations = [
    {
      id: 1,
      bookId: 1,
      title: "Introduction to Computer Science",
      author: "John Smith",
      isbn: "978-0123456789",
      reservationDate: "2025-10-01",
      expectedAvailableDate: "2025-10-15",
      position: 3,
      status: "waiting",
      claimDeadline: "2025-10-17",
      notificationSent: true,
      coverImage: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=600&fit=crop&crop=entropy&auto=format&fm=webp&q=80"
    },
    {
      id: 2,
      bookId: 5,
      title: "Software Engineering Principles",
      author: "Lisa Garcia",
      isbn: "978-0789012345",
      reservationDate: "2025-09-28",
      expectedAvailableDate: "2025-10-10",
      position: 1,
      status: "ready",
      claimDeadline: "2025-10-12",
      notificationSent: true,
      coverImage: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=600&fit=crop&crop=entropy&auto=format&fm=webp&q=80"
    }
  ];

  useEffect(() => {
    setAvailableBooks(mockAvailableBooks);
    setMyReservations(mockReservations);
  }, []);

  const handleReserveBook = (bookId) => {
    // In real implementation, this would call an API
    const book = availableBooks.find(b => b.id === bookId);
    if (book && book.canReserve) {
      const newReservation = {
        id: Date.now(),
        bookId: book.id,
        title: book.title,
        author: book.author,
        isbn: book.isbn,
        reservationDate: new Date().toISOString().split('T')[0],
        expectedAvailableDate: book.expectedReturnDate,
        position: book.reservationCount + 1,
        status: 'waiting',
        claimDeadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        notificationSent: false,
        rating: book.rating,
        coverImage: book.coverImage
      };
      
      setMyReservations(prev => [...prev, newReservation]);
      
      // Update the book's reservation count
      setAvailableBooks(prev => 
        prev.map(b => 
          b.id === bookId 
            ? { ...b, reservationCount: b.reservationCount + 1 }
            : b
        )
      );
      
      // Close detail view
      setSelectedBook(null);
    }
  };

  const handleCancelReservation = (reservationId) => {
    setMyReservations(prev => prev.filter(r => r.id !== reservationId));
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'ready':
        return <span className="badge bg-success">Ready to Claim</span>;
      case 'waiting':
        return <span className="badge bg-warning">In Queue</span>;
      case 'expired':
        return <span className="badge bg-danger">Expired</span>;
      default:
        return <span className="badge bg-secondary">Unknown</span>;
    }
  };

  const filteredAvailableBooks = availableBooks.filter(book => {
    const matchesSearch = book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         book.isbn.includes(searchTerm);
    const matchesCategory = filterCategory === 'all' || book.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = [...new Set(availableBooks.map(book => book.category))];

  // Book Detail View Component
  const BookDetailView = ({ book, onClose }) => {
    if (!book) return null;
    
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'linear-gradient(135deg, #6BA3BE 0%, #0C969C 50%, #0A7075 100%)',
        zIndex: 1050,
        overflowY: 'auto'
      }}>
        {/* Header */}
        <div style={{
          position: 'sticky',
          top: 0,
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          zIndex: 10,
          padding: window.innerWidth < 768 ? '12px 16px' : '16px 20px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 4px 20px rgba(12, 150, 156, 0.1)'
        }}>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(12, 150, 156, 0.1)',
              border: 'none',
              borderRadius: '50%',
              width: window.innerWidth < 768 ? '36px' : '40px',
              height: window.innerWidth < 768 ? '36px' : '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#0C969C',
              fontSize: window.innerWidth < 768 ? '16px' : '20px',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'rgba(12, 150, 156, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'rgba(12, 150, 156, 0.1)';
            }}
          >
            <FaArrowLeft />
          </button>
        </div>

        {/* Book Image */}
        <div style={{ position: 'relative' }}>
          <img
            src={book.coverImage}
            alt={book.title}
            style={{
              width: '100%',
              height: window.innerWidth < 768 ? '280px' : '350px',
              objectFit: 'cover'
            }}
          />
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.1) 100%)'
          }} />
          <button
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(10px)',
              border: 'none',
              borderRadius: '50%',
              width: window.innerWidth < 768 ? '40px' : '48px',
              height: window.innerWidth < 768 ? '40px' : '48px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              color: '#0C969C'
            }}
          >
            <FaHeart size={window.innerWidth < 768 ? 16 : 20} />
          </button>
        </div>

        {/* Book Info */}
        <div style={{ 
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          margin: window.innerWidth < 768 ? '16px' : '20px',
          borderRadius: window.innerWidth < 768 ? '20px' : '24px',
          padding: window.innerWidth < 768 ? '24px' : '32px',
          boxShadow: '0 20px 40px rgba(12, 150, 156, 0.15)',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          {/* Title and Rating */}
          <div className="mb-4">
            <h4 style={{ 
              fontWeight: '700',
              marginBottom: '12px',
              color: '#0A7075',
              fontSize: window.innerWidth < 768 ? '22px' : '28px'
            }}>
              {book.title}
            </h4>
            <div className="d-flex align-items-center gap-3 mb-3">
              <div className="d-flex align-items-center">
                <span style={{ 
                  marginRight: '8px',
                  fontSize: window.innerWidth < 768 ? '18px' : '20px',
                  fontWeight: '700',
                  color: '#0C969C'
                }}>
                  {book.rating}
                </span>
                <FaStar style={{ color: '#FFB800' }} size={window.innerWidth < 768 ? 16 : 18} />
              </div>
              <span className="text-muted">·</span>
              <span style={{ 
                color: '#0C969C',
                fontWeight: '600',
                cursor: 'pointer',
                textDecoration: 'underline',
                fontSize: window.innerWidth < 768 ? '14px' : '16px'
              }}>
                {book.totalReviews} Reviews
              </span>
            </div>
            <p style={{ 
              color: '#6BA3BE',
              marginBottom: 0,
              fontSize: window.innerWidth < 768 ? '16px' : '18px',
              fontWeight: '500'
            }}>
              by {book.author}
            </p>
          </div>

          {/* Info Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: window.innerWidth < 768 ? '12px' : '16px',
            marginBottom: window.innerWidth < 768 ? '24px' : '32px'
          }}>
            <div style={{ 
              background: 'linear-gradient(135deg, #0C969C, #6BA3BE)',
              borderRadius: window.innerWidth < 768 ? '12px' : '16px',
              padding: window.innerWidth < 768 ? '16px' : '20px',
              textAlign: 'center',
              color: 'white'
            }}>
              <div>
                <small style={{ 
                  opacity: 0.9, 
                  fontSize: window.innerWidth < 768 ? '12px' : '14px' 
                }}>
                  Expected Return
                </small>
                <div style={{ 
                  fontWeight: '700', 
                  fontSize: window.innerWidth < 768 ? '16px' : '18px', 
                  marginTop: '4px' 
                }}>
                  {book.expectedReturnDate}
                </div>
              </div>
            </div>
            <div style={{ 
              background: 'linear-gradient(135deg, #6BA3BE, #0A7075)',
              borderRadius: window.innerWidth < 768 ? '12px' : '16px',
              padding: window.innerWidth < 768 ? '16px' : '20px',
              textAlign: 'center',
              color: 'white'
            }}>
              <div>
                <small style={{ 
                  opacity: 0.9, 
                  fontSize: window.innerWidth < 768 ? '12px' : '14px' 
                }}>
                  Queue Position
                </small>
                <div style={{ 
                  fontWeight: '700', 
                  fontSize: window.innerWidth < 768 ? '20px' : '24px', 
                  marginTop: '4px' 
                }}>
                  #{book.reservationCount + 1}
                </div>
              </div>
            </div>
          </div>

          {/* Book Features */}
          <div className="mb-4">
            <h6 style={{ 
              fontWeight: '700',
              marginBottom: '20px',
              color: '#0A7075',
              fontSize: window.innerWidth < 768 ? '18px' : '20px'
            }}>
              Book Information
            </h6>
            <div className={`row g-${window.innerWidth < 768 ? '3' : '4'}`}>
              <div className="col-6">
                <div className="d-flex align-items-start gap-3">
                  <div style={{
                    background: 'linear-gradient(135deg, #0C969C, #6BA3BE)',
                    borderRadius: '12px',
                    padding: window.innerWidth < 768 ? '10px' : '12px',
                    color: 'white'
                  }}>
                    <FaBook size={window.innerWidth < 768 ? 14 : 16} />
                  </div>
                  <div>
                    <small style={{ 
                      color: '#6BA3BE',
                      display: 'block',
                      fontSize: window.innerWidth < 768 ? '12px' : '14px',
                      fontWeight: '500'
                    }}>
                      Category
                    </small>
                    <small style={{ 
                      fontWeight: '700',
                      color: '#0C969C',
                      fontSize: window.innerWidth < 768 ? '14px' : '16px'
                    }}>
                      {book.category}
                    </small>
                  </div>
                </div>
              </div>
              <div className="col-6">
                <div className="d-flex align-items-start gap-3">
                  <div style={{
                    background: 'linear-gradient(135deg, #6BA3BE, #0A7075)',
                    borderRadius: '12px',
                    padding: window.innerWidth < 768 ? '10px' : '12px',
                    color: 'white'
                  }}>
                    <FaUsers size={window.innerWidth < 768 ? 14 : 16} />
                  </div>
                  <div>
                    <small style={{ 
                      color: '#6BA3BE',
                      display: 'block',
                      fontSize: window.innerWidth < 768 ? '12px' : '14px',
                      fontWeight: '500'
                    }}>
                      Reservations
                    </small>
                    <small style={{ 
                      fontWeight: '700',
                      color: '#0C969C',
                      fontSize: window.innerWidth < 768 ? '14px' : '16px'
                    }}>
                      {book.reservationCount} in queue
                    </small>
                  </div>
                </div>
              </div>
              <div className="col-6">
                <div className="d-flex align-items-start gap-3">
                  <div style={{
                    background: 'linear-gradient(135deg, #0A7075, #0C969C)',
                    borderRadius: '12px',
                    padding: window.innerWidth < 768 ? '10px' : '12px',
                    color: 'white'
                  }}>
                    <FaClock size={window.innerWidth < 768 ? 14 : 16} />
                  </div>
                  <div>
                    <small style={{ 
                      color: '#6BA3BE',
                      display: 'block',
                      fontSize: window.innerWidth < 768 ? '12px' : '14px',
                      fontWeight: '500'
                    }}>
                      Return In
                    </small>
                    <small style={{ 
                      fontWeight: '700',
                      color: '#0C969C',
                      fontSize: window.innerWidth < 768 ? '14px' : '16px'
                    }}>
                      {book.daysUntilReturn} days
                    </small>
                  </div>
                </div>
              </div>
              <div className="col-6">
                <div className="d-flex align-items-start gap-3">
                  <div style={{
                    background: 'linear-gradient(135deg, #6BA3BE, #0C969C)',
                    borderRadius: '12px',
                    padding: window.innerWidth < 768 ? '10px' : '12px',
                    color: 'white'
                  }}>
                    <FaMapMarkerAlt size={window.innerWidth < 768 ? 14 : 16} />
                  </div>
                  <div>
                    <small style={{ 
                      color: '#6BA3BE',
                      display: 'block',
                      fontSize: window.innerWidth < 768 ? '12px' : '14px',
                      fontWeight: '500'
                    }}>
                      Location
                    </small>
                    <small style={{ 
                      fontWeight: '700',
                      color: '#0C969C',
                      fontSize: window.innerWidth < 768 ? '14px' : '16px'
                    }}>
                      3rd Floor
                    </small>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="mb-4">
            <p style={{ 
              color: '#6BA3BE',
              lineHeight: '1.6',
              fontSize: window.innerWidth < 768 ? '14px' : '16px'
            }}>
              Located in the {book.location}. {book.title} is currently borrowed by {book.currentBorrower}. 
              This book is expected to be available by {book.expectedReturnDate}.
            </p>
          </div>

          {/* Reserve Button */}
          <button
            onClick={() => handleReserveBook(book.id)}
            disabled={!book.canReserve}
            style={{
              width: '100%',
              background: 'linear-gradient(135deg, #0C969C, #6BA3BE)',
              color: 'white',
              border: 'none',
              borderRadius: '16px',
              fontSize: window.innerWidth < 768 ? '16px' : '18px',
              fontWeight: '700',
              padding: window.innerWidth < 768 ? '16px' : '20px',
              boxShadow: '0 8px 24px rgba(12, 150, 156, 0.4)',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              if (window.innerWidth >= 768) {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 12px 32px rgba(12, 150, 156, 0.5)';
              }
            }}
            onMouseLeave={(e) => {
              if (window.innerWidth >= 768) {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 8px 24px rgba(12, 150, 156, 0.4)';
              }
            }}
          >
            RESERVE THIS BOOK
          </button>
        </div>
      </div>
    );
  };

  return (
    <div style={{ 
      minHeight: '100vh',
      paddingTop: '80px',
      paddingBottom: '100px'
    }}>
      {/* Show detail view if book is selected */}
      {selectedBook && (
        <BookDetailView 
          book={selectedBook} 
          onClose={() => setSelectedBook(null)} 
        />
      )}

      {/* Main Content - Only show when no book is selected */}
      {!selectedBook && (
        <div className="container-fluid px-3 px-lg-4" style={{ maxWidth: '1200px' }}>
          {/* Hero Section */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            borderRadius: isMobile ? '16px' : '24px',
            padding: isMobile ? '24px' : '40px',
            marginBottom: '20px',
            boxShadow: '0 8px 32px rgba(12, 150, 156, 0.15)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <div className="row align-items-center">
              <div className="col-lg-8">
                <h2 style={{ 
                  color: '#0C969C',
                  fontWeight: '700',
                  marginBottom: '16px',
                  fontSize: isMobile ? '1.8rem' : '2.5rem'
                }}>
                  Reserve Your Books
                </h2>
                <p style={{ 
                  color: '#0A7075',
                  marginBottom: isMobile ? '24px' : '32px',
                  fontSize: isMobile ? '1rem' : '1.1rem',
                  opacity: 0.8
                }}>
                  Find and reserve books you want to read next
                </p>
                
                {/* Search Bar */}
                <div style={{ position: 'relative', maxWidth: '500px' }}>
                  <FaSearch style={{
                    position: 'absolute',
                    left: isMobile ? '16px' : '20px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#050505ff',
                    fontSize: isMobile ? '16px' : '18px'
                  }} />
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search by title, author, or ISBN..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                      paddingLeft: isMobile ? '48px' : '55px',
                      paddingRight: isMobile ? '16px' : '20px',
                      height: isMobile ? '50px' : '60px',
                      border: '2px solid rgba(12, 150, 156, 0.2)',
                      borderRadius: isMobile ? '12px' : '16px',
                      fontSize: isMobile ? '14px' : '16px',
                      background: 'rgba(255, 255, 255, 0.8)',
                      backdropFilter: 'blur(10px)',
                      transition: 'all 0.3s ease'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#0C969C';
                      e.target.style.boxShadow = '0 0 0 4px rgba(12, 150, 156, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'rgba(12, 150, 156, 0.2)';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </div>
              </div>
              
              {/* Stats Cards */}
              <div className="col-lg-4 mt-4 mt-lg-0">
                <div className="row g-2 g-lg-3">
                  <div className="col-6">
                    <div style={{
                      background: 'linear-gradient(135deg, #0C969C, #6BA3BE)',
                      borderRadius: isMobile ? '12px' : '16px',
                      padding: isMobile ? '16px 12px' : '20px',
                      textAlign: 'center',
                      color: 'white'
                    }}>
                      <div style={{ 
                        fontSize: isMobile ? '20px' : '24px', 
                        fontWeight: '700' 
                      }}>
                        {availableBooks.length}
                      </div>
                      <small style={{ 
                        fontSize: isMobile ? '10px' : '12px', 
                        opacity: 0.9 
                      }}>
                        Available Books
                      </small>
                    </div>
                  </div>
                  <div className="col-6">
                    <div style={{
                      background: 'linear-gradient(135deg, #6BA3BE, #0A7075)',
                      borderRadius: isMobile ? '12px' : '16px',
                      padding: isMobile ? '16px 12px' : '20px',
                      textAlign: 'center',
                      color: 'white'
                    }}>
                      <div style={{ 
                        fontSize: isMobile ? '20px' : '24px', 
                        fontWeight: '700' 
                      }}>
                        {myReservations.length}
                      </div>
                      <small style={{ 
                        fontSize: isMobile ? '10px' : '12px', 
                        opacity: 0.9 
                      }}>
                        My Reservations
                      </small>
                    </div>
                  </div>
                  <div className="col-6">
                    <div style={{
                      background: 'linear-gradient(135deg, #0A7075, #0C969C)',
                      borderRadius: isMobile ? '12px' : '16px',
                      padding: isMobile ? '16px 12px' : '20px',
                      textAlign: 'center',
                      color: 'white'
                    }}>
                      <div style={{ 
                        fontSize: isMobile ? '20px' : '24px', 
                        fontWeight: '700' 
                      }}>
                        {myReservations.filter(r => r.status === 'ready').length}
                      </div>
                      <small style={{ 
                        fontSize: isMobile ? '10px' : '12px', 
                        opacity: 0.9 
                      }}>
                        Ready to Claim
                      </small>
                    </div>
                  </div>
                  <div className="col-6">
                    <div style={{
                      background: 'linear-gradient(135deg, #6BA3BE, #0C969C)',
                      borderRadius: isMobile ? '12px' : '16px',
                      padding: isMobile ? '16px 12px' : '20px',
                      textAlign: 'center',
                      color: 'white'
                    }}>
                      <div style={{ 
                        fontSize: isMobile ? '20px' : '24px', 
                        fontWeight: '700' 
                      }}>
                        {myReservations.filter(r => r.notificationSent).length}
                      </div>
                      <small style={{ 
                        fontSize: isMobile ? '10px' : '12px', 
                        opacity: 0.9 
                      }}>
                        Notifications
                      </small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="mb-3 mb-lg-4">
            <div style={{
              display: 'flex',
              gap: isMobile ? '8px' : '12px',
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              padding: isMobile ? '6px' : '8px',
              borderRadius: isMobile ? '12px' : '16px',
              boxShadow: '0 4px 20px rgba(12, 150, 156, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              maxWidth: isMobile ? '100%' : '400px'
            }}>
              <button
                onClick={() => setActiveTab('available')}
                style={{
                  flex: 1,
                  padding: isMobile ? '12px 16px' : '16px 24px',
                  border: 'none',
                  borderRadius: isMobile ? '8px' : '12px',
                  background: activeTab === 'available' 
                    ? 'linear-gradient(135deg, #0C969C, #6BA3BE)' 
                    : 'transparent',
                  color: activeTab === 'available' ? 'white' : '#0C969C',
                  fontWeight: '600',
                  fontSize: isMobile ? '14px' : '16px',
                  transition: 'all 0.3s ease',
                  boxShadow: activeTab === 'available' 
                    ? '0 4px 12px rgba(12, 150, 156, 0.3)' 
                    : 'none'
                }}
              >
                Available Books
              </button>
              <button
                onClick={() => setActiveTab('reservations')}
                style={{
                  flex: 1,
                  padding: isMobile ? '12px 16px' : '16px 24px',
                  border: 'none',
                  borderRadius: isMobile ? '8px' : '12px',
                  background: activeTab === 'reservations' 
                    ? 'linear-gradient(135deg, #0C969C, #6BA3BE)' 
                    : 'transparent',
                  color: activeTab === 'reservations' ? 'white' : '#0C969C',
                  fontWeight: '600',
                  fontSize: isMobile ? '14px' : '16px',
                  transition: 'all 0.3s ease',
                  boxShadow: activeTab === 'reservations' 
                    ? '0 4px 12px rgba(12, 150, 156, 0.3)' 
                    : 'none'
                }}
              >
                My Reservations
              </button>
            </div>
          </div>

          {/* Content */}
          {activeTab === 'available' && (
            <>
              {/* Category Filter */}
              <div className="mb-3 mb-lg-4">
                <div className="row align-items-center">
                  <div className="col-lg-6">
                    <select
                      className="form-select"
                      value={filterCategory}
                      onChange={(e) => setFilterCategory(e.target.value)}
                      style={{
                        border: '2px solid rgba(12, 150, 156, 0.2)',
                        background: 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(20px)',
                        borderRadius: window.innerWidth < 768 ? '12px' : '16px',
                        padding: window.innerWidth < 768 ? '12px 16px' : '16px 20px',
                        fontSize: window.innerWidth < 768 ? '14px' : '16px',
                        maxWidth: window.innerWidth < 768 ? '100%' : '300px',
                        color: '#0C969C',
                        fontWeight: '500'
                      }}
                    >
                      <option value="all">All Categories</option>
                      {categories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-lg-6 text-end d-none d-lg-block">
                    <span style={{ color: 'white', fontWeight: '500' }}>
                      Showing {filteredAvailableBooks.length} of {availableBooks.length} books
                    </span>
                  </div>
                </div>
              </div>

              {/* Books Grid - Responsive */}
              <div className="row g-3 g-lg-4">
                {filteredAvailableBooks.map(book => (
                  <div key={book.id} className="col-12 col-sm-6 col-lg-4">
                    <div
                      onClick={() => setSelectedBook(book)}
                      style={{
                        background: 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(20px)',
                        borderRadius: window.innerWidth < 768 ? '16px' : '20px',
                        overflow: 'hidden',
                        boxShadow: '0 8px 32px rgba(12, 150, 156, 0.15)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        height: '100%'
                      }}
                      className="book-card"
                      onMouseEnter={(e) => {
                        if (window.innerWidth >= 768) {
                          e.currentTarget.style.transform = 'translateY(-8px)';
                          e.currentTarget.style.boxShadow = '0 20px 40px rgba(12, 150, 156, 0.25)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (window.innerWidth >= 768) {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = '0 8px 32px rgba(12, 150, 156, 0.15)';
                        }
                      }}
                    >
                      {/* Mobile: Horizontal Layout */}
                      <div className="d-block d-sm-none">
                        <div style={{ display: 'flex', gap: '16px' }}>
                          {/* Book Image */}
                          <div style={{ position: 'relative', overflow: 'hidden' }}>
                            <img
                              src={book.coverImage}
                              alt={book.title}
                              style={{
                                width: '100px',
                                height: '130px',
                                objectFit: 'cover',
                                flexShrink: 0
                              }}
                            />
                            <div style={{
                              position: 'absolute',
                              top: '8px',
                              right: '8px',
                              background: 'rgba(255, 255, 255, 0.9)',
                              backdropFilter: 'blur(10px)',
                              borderRadius: '50%',
                              width: '24px',
                              height: '24px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                            }}>
                              <FaBookmark style={{ color: '#0C969C', fontSize: '10px' }} />
                            </div>
                          </div>
                          
                          {/* Book Info */}
                          <div style={{ padding: '16px 16px 16px 0', flex: 1 }}>
                            <h6 style={{ 
                              fontSize: '14px',
                              fontWeight: '700',
                              color: '#0A7075',
                              lineHeight: '1.3',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              marginBottom: '4px'
                            }}>
                              {book.title}
                            </h6>
                            <p style={{ 
                              color: '#6BA3BE',
                              fontSize: '12px',
                              marginBottom: '8px',
                              fontWeight: '500'
                            }}>
                              by {book.author}
                            </p>
                            <span style={{
                              background: 'linear-gradient(135deg, #0C969C, #6BA3BE)',
                              color: 'white',
                              fontSize: '10px',
                              fontWeight: '600',
                              padding: '3px 8px',
                              borderRadius: '6px',
                              display: 'inline-block',
                              marginBottom: '8px'
                            }}>
                              {book.category}
                            </span>

                            <div className="d-flex align-items-center gap-2 mb-2">
                              <div className="d-flex align-items-center">
                                <FaStar style={{ color: '#FFB800', marginRight: '2px' }} size={10} />
                                <span style={{ 
                                  fontSize: '12px', 
                                  fontWeight: '600',
                                  color: '#0A7075'
                                }}>
                                  {book.rating}
                                </span>
                              </div>
                              <span style={{ 
                                color: '#6BA3BE', 
                                fontSize: '10px',
                                fontWeight: '500'
                              }}>
                                ({book.totalReviews} Reviews)
                              </span>
                            </div>

                            <div style={{ 
                              marginTop: 'auto',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center'
                            }}>
                              <div>
                                <small style={{ 
                                  color: '#6BA3BE', 
                                  fontSize: '10px',
                                  display: 'block',
                                  fontWeight: '500'
                                }}>
                                  Returns in
                                </small>
                                <span style={{ 
                                  fontSize: '12px',
                                  fontWeight: '700',
                                  color: '#0C969C'
                                }}>
                                  {book.daysUntilReturn} days
                                </span>
                              </div>
                              <FaChevronRight style={{ color: '#6BA3BE' }} size={12} />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Desktop/Tablet: Vertical Layout */}
                      <div className="d-none d-sm-block">
                        {/* Book Image */}
                        <div style={{ position: 'relative', overflow: 'hidden' }}>
                          <img
                            src={book.coverImage}
                            alt={book.title}
                            style={{
                              width: '100%',
                              height: window.innerWidth < 992 ? '200px' : '240px',
                              objectFit: 'cover',
                              transition: 'transform 0.3s ease'
                            }}
                            onMouseEnter={(e) => {
                              if (window.innerWidth >= 768) {
                                e.target.style.transform = 'scale(1.05)';
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (window.innerWidth >= 768) {
                                e.target.style.transform = 'scale(1)';
                              }
                            }}
                          />
                          <div style={{
                            position: 'absolute',
                            top: '16px',
                            right: '16px',
                            background: 'rgba(255, 255, 255, 0.9)',
                            backdropFilter: 'blur(10px)',
                            borderRadius: '50%',
                            width: '40px',
                            height: '40px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                          }}>
                            <FaBookmark style={{ color: '#0C969C' }} />
                          </div>
                        </div>
                        
                        {/* Book Info */}
                        <div style={{ padding: window.innerWidth < 992 ? '20px' : '24px' }}>
                          <div className="mb-3">
                            <h5 style={{ 
                              fontSize: window.innerWidth < 992 ? '16px' : '18px',
                              fontWeight: '700',
                              color: '#0A7075',
                              lineHeight: '1.4',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              minHeight: window.innerWidth < 992 ? '44px' : '50px',
                              marginBottom: '8px'
                            }}>
                              {book.title}
                            </h5>
                            <p style={{ 
                              color: '#6BA3BE',
                              fontSize: window.innerWidth < 992 ? '14px' : '15px',
                              marginBottom: '12px',
                              fontWeight: '500'
                            }}>
                              by {book.author}
                            </p>
                            <span style={{
                              background: 'linear-gradient(135deg, #0C969C, #6BA3BE)',
                              color: 'white',
                              fontSize: '12px',
                              fontWeight: '600',
                              padding: '6px 12px',
                              borderRadius: '8px',
                              display: 'inline-block'
                            }}>
                              {book.category}
                            </span>
                          </div>

                          <div className="d-flex align-items-center gap-3 mb-3">
                            <div className="d-flex align-items-center">
                              <FaStar style={{ color: '#FFB800', marginRight: '4px' }} size={14} />
                              <span style={{ 
                                fontSize: '15px', 
                                fontWeight: '600',
                                color: '#0A7075'
                              }}>
                                {book.rating}
                              </span>
                            </div>
                            <span style={{ 
                              color: '#6BA3BE', 
                              fontSize: '14px',
                              fontWeight: '500'
                            }}>
                              ({book.totalReviews} Reviews)
                            </span>
                          </div>

                          <div className="row g-2 mb-4">
                            <div className="col-6">
                              <small style={{ 
                                color: '#6BA3BE', 
                                fontSize: '12px',
                                display: 'block',
                                fontWeight: '500'
                              }}>
                                Returns in
                              </small>
                              <span style={{ 
                                fontSize: '14px',
                                fontWeight: '700',
                                color: '#0C969C'
                              }}>
                                {book.daysUntilReturn} days
                              </span>
                            </div>
                            <div className="col-6">
                              <small style={{ 
                                color: '#6BA3BE', 
                                fontSize: '12px',
                                display: 'block',
                                fontWeight: '500'
                              }}>
                                Queue Position
                              </small>
                              <span style={{ 
                                fontSize: '14px',
                                fontWeight: '700',
                                color: '#0C969C'
                              }}>
                                #{book.reservationCount + 1}
                              </span>
                            </div>
                          </div>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleReserveBook(book.id);
                            }}
                            disabled={!book.canReserve}
                            style={{
                              width: '100%',
                              background: 'linear-gradient(135deg, #0C969C, #6BA3BE)',
                              color: 'white',
                              border: 'none',
                              borderRadius: '12px',
                              fontSize: '14px',
                              fontWeight: '600',
                              padding: '12px',
                              transition: 'all 0.3s ease',
                              boxShadow: '0 4px 12px rgba(12, 150, 156, 0.3)'
                            }}
                            onMouseEnter={(e) => {
                              if (window.innerWidth >= 768) {
                                e.target.style.boxShadow = '0 6px 16px rgba(12, 150, 156, 0.4)';
                                e.target.style.transform = 'translateY(-2px)';
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (window.innerWidth >= 768) {
                                e.target.style.boxShadow = '0 4px 12px rgba(12, 150, 156, 0.3)';
                                e.target.style.transform = 'translateY(0)';
                              }
                            }}
                          >
                            Reserve Book
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {activeTab === 'reservations' && (
            <div>
              {myReservations.length === 0 ? (
                <div className="text-center py-5">
                  <div style={{
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: window.innerWidth < 768 ? '16px' : '20px',
                    padding: window.innerWidth < 768 ? '32px 20px' : '48px 24px',
                    boxShadow: '0 8px 32px rgba(12, 150, 156, 0.15)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    margin: '0 auto',
                    maxWidth: '400px'
                  }}>
                    <FaBook size={window.innerWidth < 768 ? 48 : 56} style={{ color: '#6BA3BE', opacity: 0.5, marginBottom: '16px' }} />
                    <h5 style={{ 
                      fontWeight: '700',
                      marginBottom: '8px',
                      color: '#0A7075',
                      fontSize: window.innerWidth < 768 ? '18px' : '20px'
                    }}>
                      No Reservations Yet
                    </h5>
                    <p style={{ 
                      color: '#6BA3BE',
                      marginBottom: '24px',
                      fontSize: window.innerWidth < 768 ? '14px' : '16px'
                    }}>
                      Start reserving books to see them here
                    </p>
                    <button
                      className="btn"
                      onClick={() => setActiveTab('available')}
                      style={{
                        background: 'linear-gradient(135deg, #0C969C, #6BA3BE)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '12px',
                        fontWeight: '600',
                        padding: window.innerWidth < 768 ? '10px 20px' : '12px 24px',
                        fontSize: window.innerWidth < 768 ? '14px' : '16px',
                        boxShadow: '0 4px 12px rgba(12, 150, 156, 0.3)'
                      }}
                    >
                      Browse Books
                    </button>
                  </div>
                </div>
              ) : (
                <div className="row g-3 g-lg-4">
                  {myReservations.map(reservation => (
                    <div key={reservation.id} className="col-12 col-lg-6">
                      <div style={{
                        background: 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(20px)',
                        borderRadius: window.innerWidth < 768 ? '16px' : '20px',
                        overflow: 'hidden',
                        boxShadow: '0 8px 32px rgba(12, 150, 156, 0.15)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseEnter={(e) => {
                        if (window.innerWidth >= 768) {
                          e.currentTarget.style.boxShadow = '0 20px 40px rgba(12, 150, 156, 0.25)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (window.innerWidth >= 768) {
                          e.currentTarget.style.boxShadow = '0 8px 32px rgba(12, 150, 156, 0.15)';
                        }
                      }}>
                        <div style={{ display: 'flex', gap: window.innerWidth < 768 ? '12px' : '20px' }}>
                          {/* Book Image */}
                          <img
                            src={reservation.coverImage}
                            alt={reservation.title}
                            style={{
                              width: window.innerWidth < 768 ? '100px' : '140px',
                              height: window.innerWidth < 768 ? '130px' : '180px',
                              objectFit: 'cover',
                              flexShrink: 0
                            }}
                          />
                          
                          {/* Reservation Info */}
                          <div style={{ 
                            padding: window.innerWidth < 768 ? '16px 12px 16px 0' : '24px 24px 24px 0',
                            flex: 1,
                            display: 'flex',
                            flexDirection: 'column'
                          }}>
                            {/* Status Badge */}
                            <div className="mb-3">
                              {reservation.status === 'ready' ? (
                                <span style={{
                                  background: 'linear-gradient(135deg, #10B981, #34D399)',
                                  color: 'white',
                                  fontSize: window.innerWidth < 768 ? '10px' : '12px',
                                  fontWeight: '600',
                                  padding: window.innerWidth < 768 ? '6px 12px' : '8px 16px',
                                  borderRadius: '8px',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '6px'
                                }}>
                                  <FaCheckCircle size={window.innerWidth < 768 ? 10 : 12} />
                                  Ready to Claim
                                </span>
                              ) : (
                                <span style={{
                                  background: 'linear-gradient(135deg, #F59E0B, #FCD34D)',
                                  color: 'white',
                                  fontSize: window.innerWidth < 768 ? '10px' : '12px',
                                  fontWeight: '600',
                                  padding: window.innerWidth < 768 ? '6px 12px' : '8px 16px',
                                  borderRadius: '8px',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '6px'
                                }}>
                                  <FaClock size={window.innerWidth < 768 ? 10 : 12} />
                                  In Queue
                                </span>
                              )}
                            </div>

                            <h5 style={{ 
                              fontSize: window.innerWidth < 768 ? '14px' : '18px',
                              fontWeight: '700',
                              color: '#0A7075',
                              lineHeight: '1.4',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              marginBottom: '6px'
                            }}>
                              {reservation.title}
                            </h5>
                            <p style={{ 
                              color: '#6BA3BE',
                              fontSize: window.innerWidth < 768 ? '12px' : '15px',
                              marginBottom: window.innerWidth < 768 ? '12px' : '16px',
                              fontWeight: '500'
                            }}>
                              by {reservation.author}
                            </p>

                            <div className={`row g-${window.innerWidth < 768 ? '2' : '3'} mb-3`}>
                              <div className="col-6">
                                <small style={{ 
                                  color: '#6BA3BE', 
                                  fontSize: window.innerWidth < 768 ? '10px' : '12px',
                                  display: 'block',
                                  fontWeight: '500'
                                }}>
                                  Queue Position
                                </small>
                                <span style={{ 
                                  fontSize: window.innerWidth < 768 ? '14px' : '16px',
                                  fontWeight: '700',
                                  color: '#0C969C'
                                }}>
                                  #{reservation.position}
                                </span>
                              </div>
                              <div className="col-6">
                                <small style={{ 
                                  color: '#6BA3BE', 
                                  fontSize: window.innerWidth < 768 ? '10px' : '12px',
                                  display: 'block',
                                  fontWeight: '500'
                                }}>
                                  Reserved On
                                </small>
                                <span style={{ 
                                  fontSize: window.innerWidth < 768 ? '12px' : '14px',
                                  fontWeight: '700',
                                  color: '#0C969C'
                                }}>
                                  {reservation.reservationDate}
                                </span>
                              </div>
                            </div>

                            {reservation.status === 'ready' && (
                              <div className="mb-3">
                                <small style={{ 
                                  color: '#EF4444', 
                                  fontSize: window.innerWidth < 768 ? '10px' : '12px',
                                  display: 'block',
                                  fontWeight: '600'
                                }}>
                                  Claim Deadline: {reservation.claimDeadline}
                                </small>
                              </div>
                            )}

                            <div className={`d-flex gap-${window.innerWidth < 768 ? '2' : '3'} mt-auto`}>
                              {reservation.status === 'ready' && (
                                <button 
                                  style={{
                                    flex: 1,
                                    background: 'linear-gradient(135deg, #10B981, #34D399)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '12px',
                                    fontSize: window.innerWidth < 768 ? '12px' : '14px',
                                    fontWeight: '600',
                                    padding: window.innerWidth < 768 ? '8px' : '12px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: window.innerWidth < 768 ? '4px' : '8px',
                                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                                  }}
                                >
                                  <FaCheckCircle size={window.innerWidth < 768 ? 12 : 14} />
                                  {window.innerWidth < 768 ? 'Claim' : 'Claim Now'}
                                </button>
                              )}
                              <button
                                onClick={() => handleCancelReservation(reservation.id)}
                                style={{
                                  background: 'linear-gradient(135deg, #EF4444, #F87171)',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '12px',
                                  fontSize: window.innerWidth < 768 ? '12px' : '14px',
                                  fontWeight: '600',
                                  padding: window.innerWidth < 768 ? '8px 12px' : '12px 16px',
                                  boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
                                }}
                              >
                                <FaTimes />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default BookReservation;