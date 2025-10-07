import React, { useState, useEffect } from 'react';
import { FaBook, FaClock, FaCalendarAlt, FaEnvelope, FaBell, FaTrash, FaEye, FaSearch, FaFilter } from 'react-icons/fa';

function BookReservation() {
  const [activeTab, setActiveTab] = useState('available');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [myReservations, setMyReservations] = useState([]);
  const [availableBooks, setAvailableBooks] = useState([]);
  const [loading, setLoading] = useState(false);

  // Mock data for available books with expected return dates
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
      coverImage: "/api/placeholder/120/160"
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
      coverImage: "/api/placeholder/120/160"
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
      coverImage: "/api/placeholder/120/160"
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
      coverImage: "/api/placeholder/120/160"
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
      coverImage: "/api/placeholder/120/160"
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

  return (
    <div className="container py-4">
      <div className="row mb-4">
        <div className="col">
          <h2 className="fw-bold text-primary mb-1">Book Reservation System</h2>
          <p className="text-muted">Reserve books and manage your reservations</p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="row g-3 mb-4">
        <div className="col-md-3 col-6">
          <div className="card shadow-sm text-center p-3">
            <FaBook className="text-primary mb-2" size={24} />
            <h6 className="mb-1">Available Books</h6>
            <p className="fw-bold mb-0 fs-4">{availableBooks.length}</p>
            <small className="text-muted">Books you can reserve</small>
          </div>
        </div>
        <div className="col-md-3 col-6">
          <div className="card shadow-sm text-center p-3">
            <FaClock className="text-warning mb-2" size={24} />
            <h6 className="mb-1">My Reservations</h6>
            <p className="fw-bold mb-0 fs-4">{myReservations.length}</p>
            <small className="text-muted">Active reservations</small>
          </div>
        </div>
        <div className="col-md-3 col-6">
          <div className="card shadow-sm text-center p-3">
            <FaBell className="text-success mb-2" size={24} />
            <h6 className="mb-1">Ready to Claim</h6>
            <p className="fw-bold mb-0 fs-4">
              {myReservations.filter(r => r.status === 'ready').length}
            </p>
            <small className="text-muted">Books available</small>
          </div>
        </div>
        <div className="col-md-3 col-6">
          <div className="card shadow-sm text-center p-3">
            <FaEnvelope className="text-info mb-2" size={24} />
            <h6 className="mb-1">Notifications</h6>
            <p className="fw-bold mb-0 fs-4">
              {myReservations.filter(r => r.notificationSent).length}
            </p>
            <small className="text-muted">Email alerts sent</small>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="card shadow-sm mb-4">
        <div className="card-header p-0">
          <div className="d-flex">
            <button
              className={`btn ${activeTab === 'available' ? 'btn-primary' : 'btn-outline-secondary'} flex-grow-1`}
              onClick={() => setActiveTab('available')}
              style={{ 
                borderRadius: 0,
                borderTopLeftRadius: "0.375rem"
              }}
            >
              <FaBook className="me-2" />
              Available Books
              <span className="badge bg-light text-dark ms-2">{availableBooks.length}</span>
            </button>
            <button
              className={`btn ${activeTab === 'reservations' ? 'btn-primary' : 'btn-outline-secondary'} flex-grow-1`}
              onClick={() => setActiveTab('reservations')}
              style={{ 
                borderRadius: 0,
                borderTopRightRadius: "0.375rem"
              }}
            >
              <FaClock className="me-2" />
              My Reservations
              <span className="badge bg-light text-dark ms-2">{myReservations.length}</span>
            </button>
          </div>
        </div>
        <div className="card-body">
          {activeTab === 'available' && (
            <>
              {/* Search and Filter */}
              <div className="row mb-4">
                <div className="col-md-8">
                  <div className="input-group">
                    <span className="input-group-text">
                      <FaSearch />
                    </span>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Search by title, author, or ISBN..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                <div className="col-md-4">
                  <select
                    className="form-select"
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                  >
                    <option value="all">All Categories</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Available Books Grid */}
              <div className="row g-3">
                {filteredAvailableBooks.map(book => (
                  <div key={book.id} className="col-lg-4 col-md-6">
                    <div className="card h-100 shadow-sm">
                      <div className="card-body">
                        <div className="d-flex mb-3">
                          <img
                            src={book.coverImage}
                            alt={book.title}
                            className="me-3"
                            style={{ width: '60px', height: '80px', objectFit: 'cover' }}
                          />
                          <div className="flex-grow-1">
                            <h6 className="fw-bold mb-1">{book.title}</h6>
                            <p className="text-muted mb-1 small">by {book.author}</p>
                            <p className="text-muted mb-1 small">ISBN: {book.isbn}</p>
                            <span className="badge bg-info">{book.category}</span>
                          </div>
                        </div>
                        
                        <div className="mb-3">
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <small className="text-muted">Current Borrower:</small>
                            <small className="fw-bold">{book.currentBorrower}</small>
                          </div>
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <small className="text-muted">Expected Return:</small>
                            <small className="fw-bold text-success">{book.expectedReturnDate}</small>
                          </div>
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <small className="text-muted">Days Until Return:</small>
                            <span className={`badge ${book.daysUntilReturn <= 3 ? 'bg-success' : 'bg-warning'}`}>
                              {book.daysUntilReturn} days
                            </span>
                          </div>
                          <div className="d-flex justify-content-between align-items-center">
                            <small className="text-muted">Queue Position:</small>
                            <span className="badge bg-secondary">{book.reservationCount + 1}</span>
                          </div>
                        </div>
                        
                        <button
                          className="btn btn-primary w-100"
                          onClick={() => handleReserveBook(book.id)}
                          disabled={!book.canReserve}
                        >
                          <FaBook className="me-2" />
                          Reserve Book
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {activeTab === 'reservations' && (
            <div className="row g-3">
              {myReservations.length === 0 ? (
                <div className="col-12">
                  <div className="text-center py-5">
                    <FaBook size={48} className="text-muted mb-3" />
                    <h5 className="text-muted">No Reservations Yet</h5>
                    <p className="text-muted">You haven't made any book reservations.</p>
                    <button
                      className="btn btn-primary"
                      onClick={() => setActiveTab('available')}
                    >
                      Browse Available Books
                    </button>
                  </div>
                </div>
              ) : (
                myReservations.map(reservation => (
                  <div key={reservation.id} className="col-lg-6">
                    <div className="card shadow-sm">
                      <div className="card-body">
                        <div className="d-flex mb-3">
                          <img
                            src={reservation.coverImage}
                            alt={reservation.title}
                            className="me-3"
                            style={{ width: '60px', height: '80px', objectFit: 'cover' }}
                          />
                          <div className="flex-grow-1">
                            <h6 className="fw-bold mb-1">{reservation.title}</h6>
                            <p className="text-muted mb-1 small">by {reservation.author}</p>
                            <p className="text-muted mb-2 small">ISBN: {reservation.isbn}</p>
                            {getStatusBadge(reservation.status)}
                          </div>
                        </div>
                        
                        <div className="mb-3">
                          <div className="d-flex justify-content-between mb-2">
                            <small className="text-muted">Reserved on:</small>
                            <small className="fw-bold">{reservation.reservationDate}</small>
                          </div>
                          <div className="d-flex justify-content-between mb-2">
                            <small className="text-muted">Expected Available:</small>
                            <small className="fw-bold text-success">{reservation.expectedAvailableDate}</small>
                          </div>
                          <div className="d-flex justify-content-between mb-2">
                            <small className="text-muted">Queue Position:</small>
                            <span className="badge bg-info">{reservation.position}</span>
                          </div>
                          {reservation.status === 'ready' && (
                            <div className="d-flex justify-content-between">
                              <small className="text-muted">Claim by:</small>
                              <small className="fw-bold text-danger">{reservation.claimDeadline}</small>
                            </div>
                          )}
                        </div>
                        
                        <div className="d-flex gap-2">
                          {reservation.status === 'ready' && (
                            <button className="btn btn-success flex-grow-1">
                              <FaEye className="me-2" />
                              Claim Now
                            </button>
                          )}
                          <button
                            className="btn btn-outline-danger"
                            onClick={() => handleCancelReservation(reservation.id)}
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default BookReservation;