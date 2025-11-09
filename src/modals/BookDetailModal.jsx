import React, { useState } from 'react';
import { FaArrowLeft, FaHeart, FaStar, FaBook, FaUsers, FaClock, FaMapMarkerAlt, FaCheckCircle, FaBookmark } from 'react-icons/fa';

const BookDetailModal = ({ book, onClose, onReserve }) => {
  if (!book) return null;

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [reservingCopyId, setReservingCopyId] = useState(null);

  // Listen for window resize
  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleReserveCopy = (copyId) => {
    // Show confirmation dialog
    const confirmReservation = window.confirm(
      `Are you sure you want to reserve this book copy?\n\nBook: ${book.book_title}\nCopy ID: ${copyId}\n\nYour reservation will be pending for approval.`
    );
    
    if (confirmReservation) {
      setReservingCopyId(copyId);
      if (onReserve) {
        onReserve(copyId);
      }
      // Reset after animation
      setTimeout(() => setReservingCopyId(null), 2000);
    }
  };

  // Filter available, borrowed, and reserved copies (all visible, but reserved will be disabled)
  const reservableCopies = book.copies?.filter(copy => 
    copy.status?.toLowerCase() === 'available' || 
    copy.status?.toLowerCase() === 'borrowed' ||
    copy.status?.toLowerCase() === 'reserved'
  ) || [];
  
  return (
    <>
      {/* Custom scrollbar styles */}
      <style>{`
        .copies-scroll::-webkit-scrollbar {
          width: 8px;
        }
        .copies-scroll::-webkit-scrollbar-track {
          background: rgba(12, 150, 156, 0.05);
          border-radius: 10px;
        }
        .copies-scroll::-webkit-scrollbar-thumb {
          background: linear-gradient(135deg, #0C969C, #6BA3BE);
          border-radius: 10px;
        }
        .copies-scroll::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(135deg, #0A7075, #0C969C);
        }
      `}</style>
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
            transition: 'all 0.3s ease',
            cursor: 'pointer'
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
          alt={book.book_title || book.title}
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
            color: '#0C969C',
            cursor: 'pointer'
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
            {book.book_title || book.title}
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
          gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)',
          gap: isMobile ? '10px' : '12px',
          marginBottom: isMobile ? '24px' : '32px'
        }}>
          <div style={{ 
            background: 'linear-gradient(135deg, #0C969C, #6BA3BE)',
            borderRadius: isMobile ? '12px' : '14px',
            padding: isMobile ? '14px' : '16px',
            textAlign: 'center',
            color: 'white'
          }}>
            <div>
              <small style={{ 
                opacity: 0.9, 
                fontSize: isMobile ? '11px' : '12px',
                display: 'block',
                marginBottom: '4px'
              }}>
                Total Copies
              </small>
              <div style={{ 
                fontWeight: '700', 
                fontSize: isMobile ? '20px' : '24px'
              }}>
                {book.totalCopies || 0}
              </div>
            </div>
          </div>
          <div style={{ 
            background: 'linear-gradient(135deg, #10B981, #34D399)',
            borderRadius: isMobile ? '12px' : '14px',
            padding: isMobile ? '14px' : '16px',
            textAlign: 'center',
            color: 'white'
          }}>
            <div>
              <small style={{ 
                opacity: 0.9, 
                fontSize: isMobile ? '11px' : '12px',
                display: 'block',
                marginBottom: '4px'
              }}>
                Available
              </small>
              <div style={{ 
                fontWeight: '700', 
                fontSize: isMobile ? '20px' : '24px'
              }}>
                {book.availableCopies || 0}
              </div>
            </div>
          </div>
          <div style={{ 
            background: 'linear-gradient(135deg, #F59E0B, #FCD34D)',
            borderRadius: isMobile ? '12px' : '14px',
            padding: isMobile ? '14px' : '16px',
            textAlign: 'center',
            color: 'white'
          }}>
            <div>
              <small style={{ 
                opacity: 0.9, 
                fontSize: isMobile ? '11px' : '12px',
                display: 'block',
                marginBottom: '4px'
              }}>
                On Loan
              </small>
              <div style={{ 
                fontWeight: '700', 
                fontSize: isMobile ? '20px' : '24px'
              }}>
                {book.borrowedCopies || 0}
              </div>
            </div>
          </div>
          <div style={{ 
            background: 'linear-gradient(135deg, #6BA3BE, #0A7075)',
            borderRadius: isMobile ? '12px' : '14px',
            padding: isMobile ? '14px' : '16px',
            textAlign: 'center',
            color: 'white'
          }}>
            <div>
              <small style={{ 
                opacity: 0.9, 
                fontSize: isMobile ? '11px' : '12px',
                display: 'block',
                marginBottom: '4px'
              }}>
                Reserved
              </small>
              <div style={{ 
                fontWeight: '700', 
                fontSize: isMobile ? '20px' : '24px'
              }}>
                {book.reservedCopies || 0}
              </div>
            </div>
          </div>
        </div>

        {/* Book Features */}
        <div className="mb-4">
          <h6 style={{ 
            fontWeight: '700',
            marginBottom: '16px',
            color: '#0A7075',
            fontSize: isMobile ? '18px' : '20px'
          }}>
            Book Information
          </h6>
          <div className={`row g-${isMobile ? '3' : '4'}`}>
            <div className="col-6">
              <div className="d-flex align-items-start gap-3">
                <div style={{
                  background: 'linear-gradient(135deg, #0C969C, #6BA3BE)',
                  borderRadius: '12px',
                  padding: isMobile ? '10px' : '12px',
                  color: 'white'
                }}>
                  <FaBook size={isMobile ? 14 : 16} />
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <small style={{ 
                    color: '#6BA3BE',
                    display: 'block',
                    fontSize: isMobile ? '12px' : '13px',
                    fontWeight: '500'
                  }}>
                    Category
                  </small>
                  <small style={{ 
                    fontWeight: '700',
                    color: '#0C969C',
                    fontSize: isMobile ? '13px' : '15px',
                    display: 'block',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {book.genre || book.category}
                  </small>
                </div>
              </div>
            </div>
            <div className="col-6">
              <div className="d-flex align-items-start gap-3">
                <div style={{
                  background: 'linear-gradient(135deg, #6BA3BE, #0A7075)',
                  borderRadius: '12px',
                  padding: isMobile ? '10px' : '12px',
                  color: 'white'
                }}>
                  <FaMapMarkerAlt size={isMobile ? 14 : 16} />
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <small style={{ 
                    color: '#6BA3BE',
                    display: 'block',
                    fontSize: isMobile ? '12px' : '13px',
                    fontWeight: '500'
                  }}>
                    Location
                  </small>
                  <small style={{ 
                    fontWeight: '700',
                    color: '#0C969C',
                    fontSize: isMobile ? '13px' : '15px',
                    display: 'block',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {book.location || 'Not specified'}
                  </small>
                </div>
              </div>
            </div>
            {book.publisher && (
              <div className="col-6">
                <div className="d-flex align-items-start gap-3">
                  <div style={{
                    background: 'linear-gradient(135deg, #0A7075, #0C969C)',
                    borderRadius: '12px',
                    padding: isMobile ? '10px' : '12px',
                    color: 'white'
                  }}>
                    <FaBook size={isMobile ? 14 : 16} />
                  </div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <small style={{ 
                      color: '#6BA3BE',
                      display: 'block',
                      fontSize: isMobile ? '12px' : '13px',
                      fontWeight: '500'
                    }}>
                      Publisher
                    </small>
                    <small style={{ 
                      fontWeight: '700',
                      color: '#0C969C',
                      fontSize: isMobile ? '13px' : '15px',
                      display: 'block',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {book.publisher}
                    </small>
                  </div>
                </div>
              </div>
            )}
            {book.book_year && (
              <div className="col-6">
                <div className="d-flex align-items-start gap-3">
                  <div style={{
                    background: 'linear-gradient(135deg, #6BA3BE, #0C969C)',
                    borderRadius: '12px',
                    padding: isMobile ? '10px' : '12px',
                    color: 'white'
                  }}>
                    <FaClock size={isMobile ? 14 : 16} />
                  </div>
                  <div>
                    <small style={{ 
                      color: '#6BA3BE',
                      display: 'block',
                      fontSize: isMobile ? '12px' : '13px',
                      fontWeight: '500'
                    }}>
                      Year
                    </small>
                    <small style={{ 
                      fontWeight: '700',
                      color: '#0C969C',
                      fontSize: isMobile ? '13px' : '15px'
                    }}>
                      {book.book_year}
                    </small>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Available Copies Section */}
        <div className="mb-4">
          <h6 style={{ 
            fontWeight: '700',
            marginBottom: '16px',
            color: '#0A7075',
            fontSize: isMobile ? '18px' : '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <FaBookmark style={{ color: '#0C969C' }} />
            Available Copies ({reservableCopies.length})
          </h6>

          {reservableCopies.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: isMobile ? '24px 16px' : '32px 24px',
              background: 'rgba(12, 150, 156, 0.05)',
              borderRadius: '12px',
              border: '1px dashed rgba(12, 150, 156, 0.2)'
            }}>
              <FaBook size={32} style={{ color: '#6BA3BE', opacity: 0.5, marginBottom: '12px' }} />
              <p style={{ 
                color: '#6BA3BE',
                fontSize: isMobile ? '14px' : '16px',
                marginBottom: 0,
                fontWeight: '500'
              }}>
                No copies available at the moment. Please check back later.
              </p>
            </div>
          ) : (
            <div 
              className="copies-scroll"
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: isMobile ? '12px' : '16px',
                maxHeight: isMobile ? '320px' : '450px',
                overflowY: 'auto',
                paddingRight: '8px'
              }}
            >
              {reservableCopies.map((copy, index) => {
                const isAvailable = copy.status?.toLowerCase() === 'available';
                const isReserved = copy.status?.toLowerCase() === 'reserved';
                const isBorrowed = copy.status?.toLowerCase() === 'borrowed';
                const isReserving = reservingCopyId === copy.book_id;
                
                // Generate location string from book's shelf data
                const locationText = book.location || 
                  `${book.shelf_number ? `Shelf ${book.shelf_number}` : ''}${book.shelf_column ? `, Col ${book.shelf_column}` : ''}${book.shelf_row ? `, Row ${book.shelf_row}` : ''}`.replace(/^, /, '').trim() || 
                  'Location not specified';
                
                // Determine border color based on status
                let borderColor = 'rgba(107, 163, 190, 0.3)'; // Default gray
                if (isAvailable) borderColor = 'rgba(16, 185, 129, 0.3)'; // Green
                else if (isReserved) borderColor = 'rgba(139, 92, 246, 0.4)'; // Purple
                else if (isBorrowed) borderColor = 'rgba(245, 158, 11, 0.3)'; // Amber
                
                return (
                  <div
                    key={copy.book_id}
                    style={{
                      background: 'rgba(255, 255, 255, 0.95)',
                      borderRadius: isMobile ? '14px' : '16px',
                      padding: '0',
                      border: `2px solid ${borderColor}`,
                      overflow: 'hidden',
                      transition: 'all 0.3s ease',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                      opacity: isReserved ? 0.75 : 1
                    }}
                  >
                    <div style={{ display: 'flex', gap: isMobile ? '12px' : '16px' }}>
                      {/* Book Cover Thumbnail */}
                      <div style={{
                        width: isMobile ? '90px' : '110px',
                        height: isMobile ? '120px' : '140px',
                        flexShrink: 0,
                        position: 'relative',
                        overflow: 'hidden'
                      }}>
                        <img
                          src={book.book_cover || book.coverImage}
                          alt={`Copy ${copy.book_number}`}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                          }}
                        />
                        {/* Status Badge Overlay */}
                        <div style={{
                          position: 'absolute',
                          top: '8px',
                          left: '8px',
                          background: isAvailable 
                            ? 'linear-gradient(135deg, #10B981, #34D399)'
                            : isReserved
                            ? 'linear-gradient(135deg, #8B5CF6, #A78BFA)'
                            : 'linear-gradient(135deg, #F59E0B, #FCD34D)',
                          color: 'white',
                          fontSize: isMobile ? '9px' : '10px',
                          fontWeight: '700',
                          padding: isMobile ? '4px 8px' : '5px 10px',
                          borderRadius: '6px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
                        }}>
                          {isAvailable ? 'Available' : isReserved ? 'Reserved' : 'On Loan'}
                        </div>
                      </div>

                      {/* Copy Information */}
                      <div style={{ 
                        flex: 1, 
                        padding: isMobile ? '12px 12px 12px 0' : '14px 16px 14px 0',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        minWidth: 0
                      }}>
                        <div>
                          {/* Copy Number */}
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            marginBottom: '8px'
                          }}>
                            <div style={{
                              fontSize: isMobile ? '15px' : '17px',
                              fontWeight: '700',
                              color: '#0A7075'
                            }}>
                              Copy #{copy.book_number}
                            </div>

                            {/* Visible inline Reserve CTA for each copy */}
                            <button
                              onClick={() => !isReserved && handleReserveCopy(copy.book_id)}
                              disabled={isReserved || reservingCopyId === copy.book_id}
                              style={{
                                marginLeft: 'auto',
                                background: isReserved
                                  ? 'linear-gradient(135deg, #8B5CF6, #A78BFA)'
                                  : reservingCopyId === copy.book_id
                                  ? 'linear-gradient(135deg, #10B981, #34D399)'
                                  : 'linear-gradient(135deg, #0C969C, #6BA3BE)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: isMobile ? '12px' : '13px',
                                fontWeight: '700',
                                padding: isMobile ? '6px 10px' : '8px 12px',
                                whiteSpace: 'nowrap',
                                boxShadow: isReserved 
                                  ? '0 4px 12px rgba(139, 92, 246, 0.3)'
                                  : '0 4px 12px rgba(12, 150, 156, 0.2)',
                                cursor: (isReserved || reservingCopyId === copy.book_id) ? 'not-allowed' : 'pointer',
                                opacity: isReserved ? 0.8 : 1,
                                transition: 'all 0.3s ease'
                              }}
                              onMouseEnter={(e) => {
                                if (!isMobile && !isReserved && reservingCopyId !== copy.book_id) {
                                  e.currentTarget.style.transform = 'translateY(-2px)';
                                }
                              }}
                              onMouseLeave={(e) => {
                                if (!isMobile && !isReserved && reservingCopyId !== copy.book_id) {
                                  e.currentTarget.style.transform = 'translateY(0)';
                                }
                              }}
                            >
                              {isReserved ? 'Reserved' : reservingCopyId === copy.book_id ? 'Reserved' : 'Reserve'}
                            </button>
                          </div>

                          {/* Location */}
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            marginBottom: '6px'
                          }}>
                            <FaMapMarkerAlt 
                              size={isMobile ? 11 : 12} 
                              style={{ color: '#0C969C', flexShrink: 0 }} 
                            />
                            <span style={{
                              fontSize: isMobile ? '12px' : '13px',
                              color: '#6BA3BE',
                              fontWeight: '500',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}>
                              {locationText}
                            </span>
                          </div>

                          {/* Book Number Info */}
                          <div style={{
                            fontSize: isMobile ? '11px' : '12px',
                            color: '#6BA3BE',
                            fontWeight: '500'
                          }}>
                            <span style={{ opacity: 0.7 }}>Book No:</span>{' '}
                            <span style={{ 
                              fontWeight: '600',
                              fontFamily: 'monospace',
                              color: '#0C969C'
                            }}>
                              {copy.book_number}
                            </span>
                          </div>
                        </div>

                        {/* Reserve Button */}
                        <button
                          onClick={() => handleReserveCopy(copy.book_id)}
                          disabled={isReserving}
                          style={{
                            background: isReserving
                              ? 'linear-gradient(135deg, #10B981, #34D399)'
                              : 'linear-gradient(135deg, #0C969C, #6BA3BE)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '10px',
                            fontSize: isMobile ? '12px' : '13px',
                            fontWeight: '700',
                            padding: isMobile ? '10px 16px' : '11px 18px',
                            whiteSpace: 'nowrap',
                            boxShadow: '0 4px 12px rgba(12, 150, 156, 0.3)',
                            transition: 'all 0.3s ease',
                            cursor: isReserving ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            alignSelf: 'flex-start',
                            marginTop: '8px'
                          }}
                          onMouseEnter={(e) => {
                            if (!isMobile && !isReserving) {
                              e.target.style.transform = 'translateY(-2px)';
                              e.target.style.boxShadow = '0 6px 16px rgba(12, 150, 156, 0.4)';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!isMobile && !isReserving) {
                              e.target.style.transform = 'translateY(0)';
                              e.target.style.boxShadow = '0 4px 12px rgba(12, 150, 156, 0.3)';
                            }
                          }}
                        >
                          {isReserving ? (
                            <>
                              <FaCheckCircle size={14} />
                              Reserved!
                            </>
                          ) : (
                            <>
                              <FaBookmark size={12} />
                              Reserve This Copy
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Reviews Section */}
        {book.reviews && book.reviews.length > 0 && (
          <div className="mb-4">
            <h6 style={{ 
              fontWeight: '700',
              marginBottom: '16px',
              color: '#0A7075',
              fontSize: isMobile ? '18px' : '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <FaStar style={{ color: '#FFB800' }} />
              User Reviews ({book.totalReviews || book.reviews.length})
            </h6>

            <div 
              className="copies-scroll"
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: isMobile ? '12px' : '16px',
                maxHeight: isMobile ? '320px' : '450px',
                overflowY: 'auto',
                paddingRight: '8px'
              }}
            >
              {book.reviews.map((review) => (
                <div
                  key={review.rating_id}
                  style={{
                    background: 'rgba(255, 255, 255, 0.95)',
                    borderRadius: isMobile ? '14px' : '16px',
                    padding: isMobile ? '16px' : '20px',
                    border: '1px solid rgba(12, 150, 156, 0.1)',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (!isMobile) {
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(12, 150, 156, 0.15)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isMobile) {
                      e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.08)';
                    }
                  }}
                >
                  {/* Review Header */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '12px',
                    gap: '12px'
                  }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontSize: isMobile ? '14px' : '16px',
                        fontWeight: '700',
                        color: '#0A7075',
                        marginBottom: '4px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {review.user_name}
                      </div>
                      <div style={{
                        fontSize: isMobile ? '11px' : '12px',
                        color: '#6BA3BE',
                        fontWeight: '500'
                      }}>
                        {new Date(review.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </div>
                    </div>
                    
                    {/* Star Rating */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      flexShrink: 0
                    }}>
                      {[...Array(5)].map((_, i) => (
                        <FaStar
                          key={i}
                          size={isMobile ? 12 : 14}
                          style={{
                            color: i < review.star_rating ? '#FFB800' : '#E5E7EB'
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Review Comment */}
                  {review.comment && (
                    <p style={{
                      fontSize: isMobile ? '13px' : '14px',
                      color: '#0A7075',
                      lineHeight: '1.6',
                      marginBottom: 0,
                      wordWrap: 'break-word'
                    }}>
                      {review.comment}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Info Note */}
        <div style={{
          background: 'rgba(12, 150, 156, 0.05)',
          borderLeft: '4px solid #0C969C',
          borderRadius: '8px',
          padding: isMobile ? '12px 14px' : '14px 16px',
          marginTop: '16px'
        }}>
          <p style={{ 
            color: '#0A7075',
            fontSize: isMobile ? '12px' : '13px',
            marginBottom: 0,
            lineHeight: '1.5',
            fontWeight: '500'
          }}>
            <strong>Note:</strong> Each copy can be reserved individually. Available copies can be borrowed immediately, while copies on loan can be reserved for when they are returned.
          </p>
        </div>
      </div>
    </div>
    </>
  );
};

export default BookDetailModal;
