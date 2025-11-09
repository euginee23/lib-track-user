import React, { useState, useEffect } from 'react';
import { FaBook, FaClock, FaCalendarAlt, FaEnvelope, FaBell, FaTrash, FaEye, FaSearch, FaFilter, FaArrowLeft, FaStar, FaMapMarkerAlt, FaUsers, FaCheckCircle, FaTimes, FaChevronRight, FaHeart, FaBookmark, FaFileAlt } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { getReservableBooks, searchBooks, getCategories } from '../../api/bookReservation/getBooks';
import { getAvailableResearches, searchResearches, getResearchDepartments } from '../../api/bookReservation/getResearches';
import { createBookReservation, createResearchReservation, deleteReservation } from '../../api/bookReservation/postReservation';
import { getUserReservations } from '../../api/bookReservation/getReservation';
import BookDetailModal from '../modals/BookDetailModal';
import ResearchDetailModal from '../modals/ResearchDetailModal';

function BookReservation() {
  // default to the "Available Books" tab when opening the page
  const [activeTab, setActiveTab] = useState('available');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [myReservations, setMyReservations] = useState([]);
  const [availableBooks, setAvailableBooks] = useState([]);
  const [availableResearches, setAvailableResearches] = useState([]);
  const [categories, setCategories] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedBook, setSelectedBook] = useState(null);
  const [selectedResearch, setSelectedResearch] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  
  // Pagination state
  const [currentPageBooks, setCurrentPageBooks] = useState(1);
  const [currentPageResearch, setCurrentPageResearch] = useState(1);
  const itemsPerPage = isMobile ? 6 : 9; 

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);


  // Load all data on initial component mount
  useEffect(() => {
    // Load all data once on component mount for better UX
    const loadAllData = async () => {
      await Promise.all([
        loadBooksData(),
        loadCategoriesData(),
        loadResearchesData(),
        loadDepartmentsData(),
        loadReservationsData()
      ]);
    };
    
    loadAllData();
  }, []); // Empty dependency array - only run once on mount

  // Function to load books data from API
  const loadBooksData = async () => {
    setLoading(true);
    setError(null);

    try {
      const books = await getReservableBooks();
      
      // Transform the data to match the component's expected format
      const transformedBooks = books.map(book => ({
        id: book.batch_registration_key,
        batch_registration_key: book.batch_registration_key,
        title: book.book_title,
        book_title: book.book_title,
        author: book.author,
        isbn: book.book_number || book.batch_registration_key,
        category: book.genre,
        genre: book.genre,
        publisher: book.publisher,
        edition: book.book_edition,
        year: book.book_year,
        price: book.book_price,
        donor: book.book_donor,
        coverImage: book.book_cover || "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400&h=600&fit=crop&crop=entropy&auto=format&fm=webp&q=80",
        location: book.location,
        totalCopies: book.totalCopies,
        availableCopies: book.availableCopies,
        borrowedCopies: book.borrowedCopies,
        reservedCopies: book.reservedCopies,
        canReserve: book.canReserve || book.borrowedCopies > 0,
        isAvailable: book.isAvailable || book.availableCopies > 0,
        // Mock data for reservation-specific fields (these would come from a reservations API)
        currentBorrower: book.borrowedCopies > 0 ? "Various Users" : null,
        expectedReturnDate: book.borrowedCopies > 0 ? "2025-11-15" : null,
        daysUntilReturn: book.borrowedCopies > 0 ? Math.ceil(Math.random() * 30) : null,
        reservationCount: book.reservedCopies || 0,
        rating: book.rating || book.average_rating || null,
        totalReviews: book.totalReviews || book.total_ratings || 0,
        reviews: book.reviews || [],
        copies: book.copies
      }));

      setAvailableBooks(transformedBooks);

    } catch (err) {
      console.error('Error loading books:', err);
      setError(err.message);
      toast.error('Failed to load books. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Function to load categories data from API
  const loadCategoriesData = async () => {
    try {
      const categoriesData = await getCategories();
      setCategories(categoriesData);
    } catch (err) {
      console.error('Error loading categories:', err);
      // Don't show error for categories, just use empty array
      setCategories([]);
    }
  };

  // Function to load research papers data from API
  const loadResearchesData = async () => {
    setLoading(true);
    setError(null);

    try {
      const researches = await getAvailableResearches();
      
      // Transform the data to match the component's expected format
      const transformedResearches = researches.map(paper => ({
        id: paper.research_paper_id,
        research_id: paper.research_paper_id,
        title: paper.research_title,
        research_title: paper.research_title,
        author: paper.authors,
        authors: paper.authors,
        category: paper.department_name,
        genre: paper.department_name,
        department: paper.department_name,
        year: paper.year_publication,
        year_publication: paper.year_publication,
        abstract: paper.research_abstract,
        research_abstract: paper.research_abstract,
        price: paper.research_paper_price,
        coverImage: paper.qr_code || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop&crop=entropy&auto=format&fm=webp&q=80",
        location: paper.location,
        
        // Research-specific properties
        type: 'research_paper',
  // keep original status from API so modals and buttons can check it
  status: paper.status,
        isAvailable: paper.isAvailable,
        canAccess: paper.canAccess,
        accessType: 'read_only',
        
        // Real ratings and reviews from API
        rating: paper.rating || paper.average_rating || null,
        totalReviews: paper.totalReviews || paper.total_ratings || 0,
        reviews: paper.reviews || [],
        // Allow reserve state from API service. Reserved papers will have canReserve=false
        canReserve: paper.canReserve,
        // Flag to indicate paper is reserved so UI can show "RESERVED"
        isReserved: paper.isReserved || false,
        
        // For compatibility with existing UI
        batch_registration_key: `RESEARCH_${paper.research_paper_id}`,
        isbn: `RES-${paper.research_paper_id}`
      }));

      setAvailableResearches(transformedResearches);

    } catch (err) {
      console.error('Error loading research papers:', err);
      setError(err.message);
      toast.error('Failed to load research papers. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Function to load departments data from API
  const loadDepartmentsData = async () => {
    try {
      const departmentsData = await getResearchDepartments();
      setDepartments(departmentsData);
    } catch (err) {
      console.error('Error loading departments:', err);
      // Don't show error for departments, just use empty array
      setDepartments([]);
    }
  };

  // Function to load user's reservations from API
  const loadReservationsData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Get user_id from localStorage or context (adjust based on your auth implementation)
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      const userId = userData.user_id || userData.id;

      if (!userId) {
        toast.error('User not logged in');
        setMyReservations([]);
        return;
      }

      const response = await getUserReservations(userId);
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch reservations');
      }

      // Transform reservations data with proper type handling
      const transformedReservations = (response.data || []).map(reservation => {
        const isBook = reservation.reservation_type === 'book';
        const isResearch = reservation.reservation_type === 'research_paper';
        
        // Handle book_cover - it's now a full URL from the backend
        let coverImage = null;
        if (isBook && reservation.book_cover) {
          // Check if it's a full URL (starts with http:// or https://)
          if (typeof reservation.book_cover === 'string' && reservation.book_cover.startsWith('http')) {
            coverImage = reservation.book_cover;
          } else if (reservation.book_cover.type === 'Buffer' && reservation.book_cover.data) {
            // Fallback for Buffer objects (if backend ever returns buffers)
            const base64String = btoa(
              String.fromCharCode(...new Uint8Array(reservation.book_cover.data))
            );
            coverImage = `data:image/jpeg;base64,${base64String}`;
          } else if (typeof reservation.book_cover === 'string') {
            // If already a base64 string
            coverImage = reservation.book_cover.startsWith('data:') 
              ? reservation.book_cover 
              : `data:image/jpeg;base64,${reservation.book_cover}`;
          }
        }

        return {
          id: reservation.reservation_id,
          reservationId: reservation.reservation_id,
          bookId: reservation.book_id,
          researchId: reservation.research_paper_id,
          title: reservation.book_title || reservation.research_title,
          author: reservation.author || reservation.authors,
          genre: reservation.genre || reservation.department,
          isbn: reservation.batch_registration_key || null,
          bookNumber: reservation.book_number,
          yearPublication: reservation.year_publication,
          reservationDate: reservation.updated_at ? new Date(reservation.updated_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : null,
          status: reservation.status?.toLowerCase() === 'pending' ? 'waiting' : 
                  reservation.status?.toLowerCase() === 'approved' ? 'ready' : 'expired',
          reason: reservation.reason,
          coverImage: coverImage,
          reservation_type: reservation.reservation_type,
          position: 1, // You might calculate this based on pending reservations
          claimDeadline: reservation.status?.toLowerCase() === 'approved' 
            ? new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
            : null
        };
      });

      setMyReservations(transformedReservations);

    } catch (err) {
      console.error('Error loading reservations:', err);
      setError(err.message);
      toast.error('Failed to load reservations. Please try again.');
      setMyReservations([]);
    } finally {
      setLoading(false);
    }
  };

  const handleReserveBook = async (copyId) => {
    try {
      // Get user_id from localStorage or context
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      const userId = userData.user_id || userData.id;

      if (!userId) {
        toast.error('Please login to reserve books');
        return;
      }

      if (!copyId) {
        toast.error('Invalid book copy');
        return;
      }

      setLoading(true);

      const response = await createBookReservation({
        book_id: copyId,
        user_id: userId
      });

      if (response.success) {
        toast.success('Book copy reserved successfully! Pending approval.');
        
        // Reload books and reservations
        await loadBooksData();
        await loadReservationsData();
        
        // Close detail view
        setSelectedBook(null);
      } else {
        throw new Error(response.message || 'Failed to reserve book');
      }

    } catch (err) {
      console.error('Error reserving book:', err);
      toast.error(err.message || 'Failed to reserve book');
    } finally {
      setLoading(false);
    }
  };

  const handleReserveResearch = async (researchId) => {
    try {
      // Get user_id from localStorage or context
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      const userId = userData.user_id || userData.id;

      if (!userId) {
        toast.error('Please login to reserve research papers');
        return;
      }

      setLoading(true);

      const response = await createResearchReservation({
        research_paper_id: researchId,
        user_id: userId
      });

      if (response.success) {
        toast.success('Research paper reserved successfully! Pending approval.');
        
        // Reload research papers and reservations
        await loadResearchesData();
        await loadReservationsData();
        
        // Close detail view
        setSelectedResearch(null);
      } else {
        throw new Error(response.message || 'Failed to reserve research paper');
      }

    } catch (err) {
      console.error('Error reserving research paper:', err);
      toast.error(err.message || 'Failed to reserve research paper');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelReservation = async (reservationId) => {
    if (!window.confirm('Are you sure you want to cancel this reservation?')) {
      return;
    }

    try {
      setLoading(true);

      const response = await deleteReservation(reservationId);

      if (response.success) {
        toast.success('Reservation cancelled successfully');
        
        // Reload reservations
        await loadReservationsData();
        await loadBooksData();
        await loadResearchesData();
      } else {
        throw new Error(response.message || 'Failed to cancel reservation');
      }

    } catch (err) {
      console.error('Error cancelling reservation:', err);
      toast.error(err.message || 'Failed to cancel reservation');
    } finally {
      setLoading(false);
    }
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
    const matchesSearch = book.book_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         book.author?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         book.batch_registration_key?.includes(searchTerm);
    const matchesCategory = filterCategory === 'all' || book.genre === filterCategory;
    return matchesSearch && matchesCategory;
  });

  // Filtered research papers
  const filteredAvailableResearches = availableResearches.filter(research => {
    const matchesSearch = research.research_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         research.authors?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         research.abstract?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = filterDepartment === 'all' || research.department === filterDepartment;
    return matchesSearch && matchesDepartment;
  });

  // Pagination calculations for books
  const totalPagesBooks = Math.ceil(filteredAvailableBooks.length / itemsPerPage);
  const indexOfLastBook = currentPageBooks * itemsPerPage;
  const indexOfFirstBook = indexOfLastBook - itemsPerPage;
  const currentBooks = filteredAvailableBooks.slice(indexOfFirstBook, indexOfLastBook);

  // Pagination calculations for research papers
  const totalPagesResearch = Math.ceil(filteredAvailableResearches.length / itemsPerPage);
  const indexOfLastResearch = currentPageResearch * itemsPerPage;
  const indexOfFirstResearch = indexOfLastResearch - itemsPerPage;
  const currentResearches = filteredAvailableResearches.slice(indexOfFirstResearch, indexOfLastResearch);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPageBooks(1);
  }, [searchTerm, filterCategory]);

  useEffect(() => {
    setCurrentPageResearch(1);
  }, [searchTerm, filterDepartment]);

  // Reset pagination when switching tabs
  useEffect(() => {
    setCurrentPageBooks(1);
    setCurrentPageResearch(1);
  }, [activeTab]);

  return (
    <div style={{ 
      minHeight: '100vh',
      paddingTop: '80px',
      paddingBottom: '100px'
    }}>
      {/* Loading State */}
          {loading && (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '56px 12px' }}>
              <div style={{
                width: 'min(880px, 96%)',
                background: 'rgba(255,255,255,0.98)',
                borderRadius: '16px',
                padding: '28px 24px',
                boxShadow: '0 18px 40px rgba(12,150,156,0.12)',
                border: '1px solid rgba(12,150,156,0.08)'
              }}>
                <div style={{ display: 'flex', gap: '18px', alignItems: 'center' }}>
                  <div style={{
                    width: 64,
                    height: 64,
                    borderRadius: 12,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    background: 'linear-gradient(135deg, #0C969C, #6BA3BE)',
                    boxShadow: '0 8px 20px rgba(12,150,156,0.24)'
                  }}>
                    <FaBook size={28} />
                  </div>

                  <div style={{ textAlign: 'left', flex: 1 }}>
                    <h4 style={{ margin: 0, color: '#0A7075', fontWeight: 800 }}>Loading library resources</h4>
                    <p style={{ margin: '6px 0 0', color: '#6BA3BE' }}>Preparing available books and research papers. This may take a moment.</p>
                    <div style={{ marginTop: 16 }}>
                      <div style={{ height: 12, background: 'rgba(12,150,156,0.08)', borderRadius: 8, overflow: 'hidden' }}>
                        <div style={{
                          width: '48%',
                          height: '100%',
                          background: 'linear-gradient(90deg, rgba(12,150,156,0.9), rgba(107,163,190,0.9))',
                          transform: 'translateX(-10%)',
                          animation: 'ltLoadingBar 1.6s ease-in-out infinite'
                        }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* inline keyframes for loading bar animation */}
              <style>{`@keyframes ltLoadingBar { 0% { transform: translateX(-30%); } 50% { transform: translateX(20%); } 100% { transform: translateX(120%); } }`}</style>
            </div>
          )}

      {/* Error State */}
      {error && !loading && (
        <div className="alert alert-danger mx-3" role="alert">
          <h5 className="alert-heading">Error Loading Books</h5>
          <p>{error}</p>
          <button 
            className="btn btn-outline-danger" 
            onClick={loadBooksData}
          >
            Try Again
          </button>
        </div>
      )}

      {/* Show detail view if book is selected */}
      {selectedBook && (
        <BookDetailModal 
          book={selectedBook} 
          onClose={() => setSelectedBook(null)}
          onReserve={handleReserveBook}
        />
      )}

      {/* Show detail view if research is selected */}
      {selectedResearch && (
        <ResearchDetailModal 
          research={selectedResearch} 
          onClose={() => setSelectedResearch(null)}
          onReserve={handleReserveResearch}
        />
      )}

      {/* Main Content - Only show when no book/research is selected and not loading */}
      {!selectedBook && !selectedResearch && !loading && (
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
                    color: '#0C969C',
                    fontSize: isMobile ? '16px' : '18px',
                    zIndex: 3,
                    opacity: 0.95,
                    pointerEvents: 'none'
                  }} />
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search ..."
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
                <div className="row g-2 g-lg-4">
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
                        {availableResearches.length}
                      </div>
                      <small style={{ 
                        fontSize: isMobile ? '10px' : '12px', 
                        opacity: 0.9 
                      }}>
                        Available Researches
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
                  flex: '1 1 33%',
                  minWidth: 0,
                  boxSizing: 'border-box',
                  padding: isMobile ? '10px 6px' : '16px 24px',
                  border: 'none',
                  borderRadius: isMobile ? '8px' : '12px',
                  background: activeTab === 'available'
                    ? 'linear-gradient(135deg, #0C969C, #6BA3BE)'
                    : 'transparent',
                  color: activeTab === 'available' ? 'white' : '#0C969C',
                  fontWeight: '600',
                  fontSize: isMobile ? '13px' : '16px',
                  transition: 'all 0.3s ease',
                  boxShadow: activeTab === 'available'
                    ? '0 4px 12px rgba(12, 150, 156, 0.3)'
                    : 'none',
                  textAlign: 'center',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                Books
              </button>
              <button
                onClick={() => setActiveTab('researches')}
                style={{
                  flex: '1 1 33%',
                  minWidth: 0,
                  boxSizing: 'border-box',
                  padding: isMobile ? '10px 6px' : '16px 24px',
                  border: 'none',
                  borderRadius: isMobile ? '8px' : '12px',
                  background: activeTab === 'researches'
                    ? 'linear-gradient(135deg, #0C969C, #6BA3BE)'
                    : 'transparent',
                  color: activeTab === 'researches' ? 'white' : '#0C969C',
                  fontWeight: '600',
                  fontSize: isMobile ? '13px' : '16px',
                  transition: 'all 0.3s ease',
                  boxShadow: activeTab === 'researches'
                    ? '0 4px 12px rgba(12, 150, 156, 0.3)'
                    : 'none',
                  textAlign: 'center',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                Research Papers
              </button>
              <button
                onClick={() => setActiveTab('reservations')}
                style={{
                  flex: '1 1 33%',
                  minWidth: 0,
                  boxSizing: 'border-box',
                  padding: isMobile ? '10px 6px' : '16px 24px',
                  border: 'none',
                  borderRadius: isMobile ? '8px' : '12px',
                  background: activeTab === 'reservations'
                    ? 'linear-gradient(135deg, #0C969C, #6BA3BE)'
                    : 'transparent',
                  color: activeTab === 'reservations' ? 'white' : '#0C969C',
                  fontWeight: '600',
                  fontSize: isMobile ? '13px' : '16px',
                  transition: 'all 0.3s ease',
                  boxShadow: activeTab === 'reservations'
                    ? '0 4px 12px rgba(12, 150, 156, 0.3)'
                    : 'none',
                  textAlign: 'center',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center'
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
                      Showing {indexOfFirstBook + 1}-{Math.min(indexOfLastBook, filteredAvailableBooks.length)} of {filteredAvailableBooks.length} books
                      {filteredAvailableBooks.length !== availableBooks.length && ` (filtered from ${availableBooks.length})`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Books Grid - Responsive */}
              <div className="row g-3 g-lg-4">
                {currentBooks.map(book => (
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
                              alt={book.book_title}
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
                              {book.book_title}
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
                              {book.genre}
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
                            alt={book.book_title}
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
                              {book.book_title}
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
                              {book.genre}
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
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Books Pagination */}
              {totalPagesBooks > 1 && (
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center',
                  gap: isMobile ? '8px' : '12px',
                  marginTop: isMobile ? '24px' : '32px',
                  flexWrap: 'wrap'
                }}>
                  <button
                    onClick={() => setCurrentPageBooks(prev => Math.max(prev - 1, 1))}
                    disabled={currentPageBooks === 1}
                    style={{
                      background: currentPageBooks === 1 
                        ? 'rgba(12, 150, 156, 0.1)' 
                        : 'linear-gradient(135deg, #0C969C, #6BA3BE)',
                      color: currentPageBooks === 1 ? '#6BA3BE' : 'white',
                      border: 'none',
                      borderRadius: '10px',
                      padding: isMobile ? '8px 16px' : '10px 20px',
                      fontSize: isMobile ? '13px' : '14px',
                      fontWeight: '600',
                      cursor: currentPageBooks === 1 ? 'not-allowed' : 'pointer',
                      transition: 'all 0.3s ease',
                      boxShadow: currentPageBooks === 1 
                        ? 'none' 
                        : '0 4px 12px rgba(12, 150, 156, 0.3)'
                    }}
                  >
                    Previous
                  </button>

                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'center' }}>
                    {[...Array(totalPagesBooks)].map((_, index) => {
                      const pageNumber = index + 1;
                      // Show first page, last page, current page, and pages around current
                      const showPage = pageNumber === 1 || 
                                      pageNumber === totalPagesBooks || 
                                      Math.abs(pageNumber - currentPageBooks) <= 1;
                      
                      if (!showPage && pageNumber === 2 && currentPageBooks > 3) {
                        return <span key={pageNumber} style={{ color: '#6BA3BE', padding: '0 4px' }}>...</span>;
                      }
                      if (!showPage && pageNumber === totalPagesBooks - 1 && currentPageBooks < totalPagesBooks - 2) {
                        return <span key={pageNumber} style={{ color: '#6BA3BE', padding: '0 4px' }}>...</span>;
                      }
                      if (!showPage) return null;

                      return (
                        <button
                          key={pageNumber}
                          onClick={() => setCurrentPageBooks(pageNumber)}
                          style={{
                            background: currentPageBooks === pageNumber
                              ? 'linear-gradient(135deg, #0C969C, #6BA3BE)'
                              : 'rgba(255, 255, 255, 0.95)',
                            color: currentPageBooks === pageNumber ? 'white' : '#0C969C',
                            border: currentPageBooks === pageNumber 
                              ? 'none' 
                              : '2px solid rgba(12, 150, 156, 0.2)',
                            borderRadius: '8px',
                            width: isMobile ? '36px' : '40px',
                            height: isMobile ? '36px' : '40px',
                            fontSize: isMobile ? '13px' : '14px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            boxShadow: currentPageBooks === pageNumber
                              ? '0 4px 12px rgba(12, 150, 156, 0.3)'
                              : 'none'
                          }}
                        >
                          {pageNumber}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => setCurrentPageBooks(prev => Math.min(prev + 1, totalPagesBooks))}
                    disabled={currentPageBooks === totalPagesBooks}
                    style={{
                      background: currentPageBooks === totalPagesBooks 
                        ? 'rgba(12, 150, 156, 0.1)' 
                        : 'linear-gradient(135deg, #0C969C, #6BA3BE)',
                      color: currentPageBooks === totalPagesBooks ? '#6BA3BE' : 'white',
                      border: 'none',
                      borderRadius: '10px',
                      padding: isMobile ? '8px 16px' : '10px 20px',
                      fontSize: isMobile ? '13px' : '14px',
                      fontWeight: '600',
                      cursor: currentPageBooks === totalPagesBooks ? 'not-allowed' : 'pointer',
                      transition: 'all 0.3s ease',
                      boxShadow: currentPageBooks === totalPagesBooks 
                        ? 'none' 
                        : '0 4px 12px rgba(12, 150, 156, 0.3)'
                    }}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}

          {/* Research Papers Content */}
          {activeTab === 'researches' && (
            <>
              {/* Department Filter */}
              <div className="mb-3 mb-lg-4">
                <div className="row align-items-center">
                  <div className="col-lg-6">
                    <select
                      className="form-select"
                      value={filterDepartment}
                      onChange={(e) => setFilterDepartment(e.target.value)}
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
                      <option value="all">All Departments</option>
                      {departments.map(department => (
                        <option key={department} value={department}>{department}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-lg-6 text-end d-none d-lg-block">
                    <span style={{ color: 'white', fontWeight: '500' }}>
                      Showing {indexOfFirstResearch + 1}-{Math.min(indexOfLastResearch, filteredAvailableResearches.length)} of {filteredAvailableResearches.length} research papers
                      {filteredAvailableResearches.length !== availableResearches.length && ` (filtered from ${availableResearches.length})`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Research Papers List - Professional Design */}
              <div className="row g-3">
                {currentResearches.map(research => (
                  <div key={research.id} className="col-12">
                    <div
                      onClick={() => setSelectedResearch(research)}
                      style={{
                        background: 'rgba(255, 255, 255, 0.98)',
                        backdropFilter: 'blur(20px)',
                        borderRadius: isMobile ? '14px' : '16px',
                        padding: '0',
                        boxShadow: '0 2px 12px rgba(12, 150, 156, 0.12)',
                        border: '1px solid rgba(12, 150, 156, 0.15)',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        overflow: 'hidden'
                      }}
                      className="research-card"
                      onMouseEnter={(e) => {
                        if (!isMobile) {
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          e.currentTarget.style.boxShadow = '0 6px 20px rgba(12, 150, 156, 0.2)';
                          e.currentTarget.style.borderColor = '#0C969C';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isMobile) {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = '0 2px 12px rgba(12, 150, 156, 0.12)';
                          e.currentTarget.style.borderColor = 'rgba(12, 150, 156, 0.15)';
                        }
                      }}
                    >
                      {/* Header Section with Icon and Title */}
                      <div style={{
                        background: 'linear-gradient(135deg, rgba(12, 150, 156, 0.05), rgba(107, 163, 190, 0.05))',
                        padding: isMobile ? '14px' : '18px',
                        borderBottom: '1px solid rgba(12, 150, 156, 0.1)'
                      }}>
                        <div style={{ 
                          display: 'flex', 
                          gap: isMobile ? '12px' : '16px',
                          alignItems: 'flex-start'
                        }}>
                          {/* Research Paper Icon */}
                          <div style={{
                            background: 'linear-gradient(135deg, #0C969C, #6BA3BE)',
                            borderRadius: '10px',
                            width: isMobile ? '44px' : '52px',
                            height: isMobile ? '44px' : '52px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                            boxShadow: '0 4px 12px rgba(12, 150, 156, 0.25)'
                          }}>
                            <FaFileAlt style={{ 
                              color: 'white', 
                              fontSize: isMobile ? '18px' : '22px' 
                            }} />
                          </div>
                          
                          {/* Title Section */}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <h5 style={{ 
                              fontSize: isMobile ? '15px' : '18px',
                              fontWeight: '700',
                              color: '#0A7075',
                              marginBottom: isMobile ? '6px' : '8px',
                              lineHeight: '1.3',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical'
                            }}>
                              {research.research_title}
                            </h5>
                            
                            {/* Authors - Desktop */}
                            {!isMobile && (
                              <p style={{ 
                                color: '#6BA3BE',
                                fontSize: '14px',
                                marginBottom: '0',
                                fontWeight: '500',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                              }}>
                                <i className="fas fa-user-edit" style={{ marginRight: '6px', fontSize: '12px' }}></i>
                                {research.authors}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Content Section */}
                      <div style={{ 
                        padding: isMobile ? '14px' : '18px'
                      }}>
                        {/* Authors - Mobile */}
                        {isMobile && (
                          <p style={{ 
                            color: '#6BA3BE',
                            fontSize: '13px',
                            marginBottom: '12px',
                            fontWeight: '500',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            lineHeight: '1.4'
                          }}>
                            <i className="fas fa-user-edit" style={{ marginRight: '6px', fontSize: '11px' }}></i>
                            {research.authors}
                          </p>
                        )}
                        
                        {/* Metadata Row */}
                        <div style={{ 
                          display: 'flex', 
                          gap: isMobile ? '6px' : '10px', 
                          flexWrap: 'wrap',
                          alignItems: 'center'
                        }}>
                          {/* Department Badge */}
                          <span style={{
                            background: 'linear-gradient(135deg, #0C969C, #6BA3BE)',
                            color: 'white',
                            padding: isMobile ? '5px 10px' : '6px 12px',
                            borderRadius: '6px',
                            fontSize: isMobile ? '10px' : '12px',
                            fontWeight: '600',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            whiteSpace: 'nowrap'
                          }}>
                            <i className="fas fa-building" style={{ fontSize: isMobile ? '9px' : '10px' }}></i>
                            {research.department}
                          </span>
                          
                          {/* Year Badge */}
                          <span style={{
                            background: 'rgba(12, 150, 156, 0.1)',
                            color: '#0C969C',
                            padding: isMobile ? '5px 10px' : '6px 12px',
                            borderRadius: '6px',
                            fontSize: isMobile ? '10px' : '12px',
                            fontWeight: '600',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            whiteSpace: 'nowrap'
                          }}>
                            <i className="fas fa-calendar-alt" style={{ fontSize: isMobile ? '9px' : '10px' }}></i>
                            {research.year_publication}
                          </span>
                          
                          {/* Rating */}
                          <span style={{
                            background: 'rgba(255, 193, 7, 0.1)',
                            color: '#F59E0B',
                            padding: isMobile ? '5px 10px' : '6px 12px',
                            borderRadius: '6px',
                            fontSize: isMobile ? '10px' : '12px',
                            fontWeight: '600',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            whiteSpace: 'nowrap'
                          }}>
                            <FaStar style={{ fontSize: isMobile ? '9px' : '10px' }} />
                            {research.rating} ({research.totalReviews})
                          </span>
                        </div>

                        {/* View Details Link - Mobile */}
                        {isMobile && (
                          <div style={{ 
                            marginTop: '12px',
                            paddingTop: '12px',
                            borderTop: '1px solid rgba(12, 150, 156, 0.1)',
                            textAlign: 'right'
                          }}>
                            <span style={{
                              color: '#0C969C',
                              fontSize: '12px',
                              fontWeight: '600',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}>
                              View Details
                              <FaChevronRight style={{ fontSize: '10px' }} />
                            </span>
                          </div>
                        )}

                        {/* Action Button - Desktop */}
                        {!isMobile && (
                          <div style={{ 
                            marginTop: '14px',
                            display: 'flex',
                            justifyContent: 'flex-end'
                          }}>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedResearch(research);
                              }}
                              style={{
                                background: 'transparent',
                                border: '2px solid #0C969C',
                                borderRadius: '8px',
                                padding: '8px 20px',
                                color: '#0C969C',
                                fontWeight: '600',
                                fontSize: '14px',
                                transition: 'all 0.3s ease',
                                whiteSpace: 'nowrap',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = '#0C969C';
                                e.currentTarget.style.color = 'white';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'transparent';
                                e.currentTarget.style.color = '#0C969C';
                              }}
                            >
                              View Details
                              <FaChevronRight style={{ fontSize: '12px' }} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Research Pagination */}
              {totalPagesResearch > 1 && (
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center',
                  gap: isMobile ? '8px' : '12px',
                  marginTop: isMobile ? '24px' : '32px',
                  flexWrap: 'wrap'
                }}>
                  <button
                    onClick={() => setCurrentPageResearch(prev => Math.max(prev - 1, 1))}
                    disabled={currentPageResearch === 1}
                    style={{
                      background: currentPageResearch === 1 
                        ? 'rgba(12, 150, 156, 0.1)' 
                        : 'linear-gradient(135deg, #0C969C, #6BA3BE)',
                      color: currentPageResearch === 1 ? '#6BA3BE' : 'white',
                      border: 'none',
                      borderRadius: '10px',
                      padding: isMobile ? '8px 16px' : '10px 20px',
                      fontSize: isMobile ? '13px' : '14px',
                      fontWeight: '600',
                      cursor: currentPageResearch === 1 ? 'not-allowed' : 'pointer',
                      transition: 'all 0.3s ease',
                      boxShadow: currentPageResearch === 1 
                        ? 'none' 
                        : '0 4px 12px rgba(12, 150, 156, 0.3)'
                    }}
                  >
                    Previous
                  </button>

                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'center' }}>
                    {[...Array(totalPagesResearch)].map((_, index) => {
                      const pageNumber = index + 1;
                      // Show first page, last page, current page, and pages around current
                      const showPage = pageNumber === 1 || 
                                      pageNumber === totalPagesResearch || 
                                      Math.abs(pageNumber - currentPageResearch) <= 1;
                      
                      if (!showPage && pageNumber === 2 && currentPageResearch > 3) {
                        return <span key={pageNumber} style={{ color: '#6BA3BE', padding: '0 4px' }}>...</span>;
                      }
                      if (!showPage && pageNumber === totalPagesResearch - 1 && currentPageResearch < totalPagesResearch - 2) {
                        return <span key={pageNumber} style={{ color: '#6BA3BE', padding: '0 4px' }}>...</span>;
                      }
                      if (!showPage) return null;

                      return (
                        <button
                          key={pageNumber}
                          onClick={() => setCurrentPageResearch(pageNumber)}
                          style={{
                            background: currentPageResearch === pageNumber
                              ? 'linear-gradient(135deg, #0C969C, #6BA3BE)'
                              : 'rgba(255, 255, 255, 0.95)',
                            color: currentPageResearch === pageNumber ? 'white' : '#0C969C',
                            border: currentPageResearch === pageNumber 
                              ? 'none' 
                              : '2px solid rgba(12, 150, 156, 0.2)',
                            borderRadius: '8px',
                            width: isMobile ? '36px' : '40px',
                            height: isMobile ? '36px' : '40px',
                            fontSize: isMobile ? '13px' : '14px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            boxShadow: currentPageResearch === pageNumber
                              ? '0 4px 12px rgba(12, 150, 156, 0.3)'
                              : 'none'
                          }}
                        >
                          {pageNumber}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => setCurrentPageResearch(prev => Math.min(prev + 1, totalPagesResearch))}
                    disabled={currentPageResearch === totalPagesResearch}
                    style={{
                      background: currentPageResearch === totalPagesResearch 
                        ? 'rgba(12, 150, 156, 0.1)' 
                        : 'linear-gradient(135deg, #0C969C, #6BA3BE)',
                      color: currentPageResearch === totalPagesResearch ? '#6BA3BE' : 'white',
                      border: 'none',
                      borderRadius: '10px',
                      padding: isMobile ? '8px 16px' : '10px 20px',
                      fontSize: isMobile ? '13px' : '14px',
                      fontWeight: '600',
                      cursor: currentPageResearch === totalPagesResearch ? 'not-allowed' : 'pointer',
                      transition: 'all 0.3s ease',
                      boxShadow: currentPageResearch === totalPagesResearch 
                        ? 'none' 
                        : '0 4px 12px rgba(12, 150, 156, 0.3)'
                    }}
                  >
                    Next
                  </button>
                </div>
              )}
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
                  {myReservations.map(reservation => {
                    const isBook = reservation.reservation_type === 'book';
                    const isResearch = reservation.reservation_type === 'research_paper';
                    
                    return (
                      <div key={reservation.id} className="col-12 col-lg-6">
                        <div style={{
                          background: 'rgba(255, 255, 255, 0.95)',
                          backdropFilter: 'blur(20px)',
                          borderRadius: window.innerWidth < 768 ? '16px' : '20px',
                          overflow: 'hidden',
                          boxShadow: '0 8px 32px rgba(12, 150, 156, 0.15)',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          transition: 'all 0.3s ease',
                          position: 'relative'
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
                          {/* Type Badge */}
                          <div style={{
                            position: 'absolute',
                            top: '12px',
                            right: '12px',
                            background: isBook 
                              ? 'linear-gradient(135deg, #3B82F6, #60A5FA)' 
                              : 'linear-gradient(135deg, #8B5CF6, #A78BFA)',
                            color: 'white',
                            fontSize: window.innerWidth < 768 ? '9px' : '11px',
                            fontWeight: '700',
                            padding: window.innerWidth < 768 ? '4px 10px' : '6px 12px',
                            borderRadius: '6px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            zIndex: 2,
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
                          }}>
                            {isBook ? <FaBook size={window.innerWidth < 768 ? 8 : 10} /> : <FaFileAlt size={window.innerWidth < 768 ? 8 : 10} />}
                            {isBook ? 'Book' : 'Research'}
                          </div>

                          <div style={{ display: 'flex', gap: window.innerWidth < 768 ? '12px' : '20px' }}>
                            {/* Book Cover or Research Paper Icon */}
                            {isBook && reservation.coverImage ? (
                              <img
                                src={reservation.coverImage}
                                alt={reservation.title}
                                style={{
                                  width: window.innerWidth < 768 ? '100px' : '140px',
                                  height: window.innerWidth < 768 ? '140px' : '200px',
                                  objectFit: 'cover',
                                  flexShrink: 0
                                }}
                              />
                            ) : (
                              <div style={{
                                width: window.innerWidth < 768 ? '100px' : '140px',
                                height: window.innerWidth < 768 ? '140px' : '200px',
                                flexShrink: 0,
                                background: isResearch 
                                  ? 'linear-gradient(135deg, #8B5CF6, #A78BFA)' 
                                  : 'linear-gradient(135deg, #6BA3BE, #0C969C)',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: window.innerWidth < 768 ? '8px' : '12px',
                                padding: '16px'
                              }}>
                                {isResearch ? (
                                  <>
                                    <FaFileAlt size={window.innerWidth < 768 ? 32 : 48} style={{ color: 'white', opacity: 0.9 }} />
                                    <div style={{
                                      color: 'white',
                                      fontSize: window.innerWidth < 768 ? '9px' : '11px',
                                      fontWeight: '700',
                                      textAlign: 'center',
                                      opacity: 0.9,
                                      textTransform: 'uppercase',
                                      letterSpacing: '1px'
                                    }}>
                                      Research<br/>Paper
                                    </div>
                                  </>
                                ) : (
                                  <>
                                    <FaBook size={window.innerWidth < 768 ? 32 : 48} style={{ color: 'white', opacity: 0.9 }} />
                                    <div style={{
                                      color: 'white',
                                      fontSize: window.innerWidth < 768 ? '9px' : '11px',
                                      fontWeight: '700',
                                      textAlign: 'center',
                                      opacity: 0.9,
                                      textTransform: 'uppercase',
                                      letterSpacing: '1px'
                                    }}>
                                      No Cover<br/>Available
                                    </div>
                                  </>
                                )}
                              </div>
                            )}
                            
                            {/* Reservation Info */}
                            <div style={{ 
                              padding: window.innerWidth < 768 ? '16px 12px 16px 0' : '24px 24px 24px 0',
                              flex: 1,
                              display: 'flex',
                              flexDirection: 'column'
                            }}>
                              {/* Status Badge */}
                              <div className="mb-2">
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
                                    Pending Approval
                                  </span>
                                )}
                              </div>

                              <h5 style={{ 
                                fontSize: window.innerWidth < 768 ? '14px' : '17px',
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
                                fontSize: window.innerWidth < 768 ? '11px' : '14px',
                                marginBottom: window.innerWidth < 768 ? '8px' : '12px',
                                fontWeight: '500',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                display: '-webkit-box',
                                WebkitLineClamp: 1,
                                WebkitBoxOrient: 'vertical'
                              }}>
                                by {reservation.author}
                              </p>

                              {/* Genre/Department and Additional Info */}
                              <div className="mb-2">
                                <span style={{
                                  background: 'rgba(12, 150, 156, 0.1)',
                                  color: '#0C969C',
                                  fontSize: window.innerWidth < 768 ? '9px' : '11px',
                                  fontWeight: '600',
                                  padding: window.innerWidth < 768 ? '4px 8px' : '5px 10px',
                                  borderRadius: '6px',
                                  display: 'inline-block'
                                }}>
                                  {reservation.genre || 'General'}
                                </span>
                                {isBook && reservation.bookNumber && (
                                  <span style={{
                                    color: '#6BA3BE',
                                    fontSize: window.innerWidth < 768 ? '9px' : '11px',
                                    fontWeight: '600',
                                    marginLeft: '8px'
                                  }}>
                                    #{reservation.bookNumber}
                                  </span>
                                )}
                                {isResearch && reservation.yearPublication && (
                                  <span style={{
                                    color: '#6BA3BE',
                                    fontSize: window.innerWidth < 768 ? '9px' : '11px',
                                    fontWeight: '600',
                                    marginLeft: '8px'
                                  }}>
                                    {reservation.yearPublication}
                                  </span>
                                )}
                              </div>

                              <div className={`row g-${window.innerWidth < 768 ? '2' : '3'} mb-3`}>
                                <div className="col-6">
                                  <small style={{ 
                                    color: '#6BA3BE', 
                                    fontSize: window.innerWidth < 768 ? '9px' : '11px',
                                    display: 'block',
                                    fontWeight: '500'
                                  }}>
                                    Queue Position
                                  </small>
                                  <span style={{ 
                                    fontSize: window.innerWidth < 768 ? '13px' : '16px',
                                    fontWeight: '700',
                                    color: '#0C969C'
                                  }}>
                                    #{reservation.position}
                                  </span>
                                </div>
                                <div className="col-6">
                                  <small style={{ 
                                    color: '#6BA3BE', 
                                    fontSize: window.innerWidth < 768 ? '9px' : '11px',
                                    display: 'block',
                                    fontWeight: '500'
                                  }}>
                                    Reserved On
                                  </small>
                                  <span style={{ 
                                    fontSize: window.innerWidth < 768 ? '10px' : '13px',
                                    fontWeight: '700',
                                    color: '#0C969C'
                                  }}>
                                    {reservation.reservationDate}
                                  </span>
                                </div>
                              </div>

                              {reservation.status === 'ready' && reservation.claimDeadline && (
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
                                      fontSize: window.innerWidth < 768 ? '11px' : '14px',
                                      fontWeight: '600',
                                      padding: window.innerWidth < 768 ? '8px' : '12px',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      gap: window.innerWidth < 768 ? '4px' : '8px',
                                      boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                                      cursor: 'pointer',
                                      transition: 'transform 0.2s'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                  >
                                    <FaCheckCircle size={window.innerWidth < 768 ? 11 : 14} />
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
                                    fontSize: window.innerWidth < 768 ? '11px' : '14px',
                                    fontWeight: '600',
                                    padding: window.innerWidth < 768 ? '8px 12px' : '12px 16px',
                                    boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
                                    cursor: 'pointer',
                                    transition: 'transform 0.2s',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: window.innerWidth < 768 ? '4px' : '6px'
                                  }}
                                  onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                  title="Cancel Reservation"
                                >
                                  <FaTimes size={window.innerWidth < 768 ? 11 : 14} />
                                  {window.innerWidth >= 768 && 'Cancel'}
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
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