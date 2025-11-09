import React from 'react';
import { FaArrowLeft, FaStar, FaFileAlt, FaMapMarkerAlt, FaCalendarAlt, FaEye } from 'react-icons/fa';

const ResearchDetailModal = ({ research, onClose, onReserve }) => {
  if (!research) return null;
  
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
        background: 'rgba(255, 255, 255, 0.98)',
        backdropFilter: 'blur(20px)',
        zIndex: 10,
        padding: window.innerWidth < 768 ? '16px 20px' : '20px 32px',
        borderBottom: '2px solid rgba(12, 150, 156, 0.15)',
        boxShadow: '0 2px 12px rgba(12, 150, 156, 0.08)',
        display: 'flex',
        alignItems: 'center',
        gap: '16px'
      }}>
        <button
          onClick={onClose}
          style={{
            background: 'rgba(12, 150, 156, 0.1)',
            border: 'none',
            borderRadius: '8px',
            width: window.innerWidth < 768 ? '36px' : '40px',
            height: window.innerWidth < 768 ? '36px' : '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#0C969C',
            fontSize: window.innerWidth < 768 ? '16px' : '18px',
            transition: 'all 0.3s ease',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = '#0C969C';
            e.target.style.color = 'white';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'rgba(12, 150, 156, 0.1)';
            e.target.style.color = '#0C969C';
          }}
        >
          <FaArrowLeft />
        </button>
        <div>
          <h6 style={{ 
            margin: 0, 
            color: '#0A7075', 
            fontSize: window.innerWidth < 768 ? '14px' : '16px',
            fontWeight: '700'
          }}>
            Research Paper Details
          </h6>
        </div>
      </div>

      {/* Main Content Container */}
      <div style={{ 
        maxWidth: '900px',
        margin: '0 auto',
        padding: window.innerWidth < 768 ? '20px' : '40px 20px'
      }}>
        {/* Research Paper Card */}
        <div style={{ 
          background: 'rgba(255, 255, 255, 0.98)',
          backdropFilter: 'blur(20px)',
          borderRadius: window.innerWidth < 768 ? '16px' : '20px',
          padding: window.innerWidth < 768 ? '24px' : '40px',
          boxShadow: '0 4px 24px rgba(12, 150, 156, 0.12)',
          border: '1px solid rgba(12, 150, 156, 0.15)',
          marginBottom: window.innerWidth < 768 ? '16px' : '24px'
        }}>
          {/* Research Icon Header */}
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: window.innerWidth < 768 ? '16px' : '24px',
            marginBottom: window.innerWidth < 768 ? '24px' : '32px',
            paddingBottom: window.innerWidth < 768 ? '20px' : '28px',
            borderBottom: '2px solid rgba(12, 150, 156, 0.1)'
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #0C969C, #6BA3BE)',
              borderRadius: '12px',
              width: window.innerWidth < 768 ? '60px' : '72px',
              height: window.innerWidth < 768 ? '60px' : '72px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              boxShadow: '0 6px 16px rgba(12, 150, 156, 0.3)'
            }}>
              <FaFileAlt style={{ 
                color: 'white', 
                fontSize: window.innerWidth < 768 ? '28px' : '32px' 
              }} />
            </div>
            
            <div style={{ flex: 1 }}>
              <h3 style={{ 
                fontWeight: '700',
                marginBottom: '12px',
                color: '#0A7075',
                fontSize: window.innerWidth < 768 ? '20px' : '26px',
                lineHeight: '1.3'
              }}>
                {research.research_title}
              </h3>
              
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                flexWrap: 'wrap',
                marginBottom: '12px'
              }}>
                <div style={{
                  background: 'rgba(255, 193, 7, 0.1)',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <FaStar style={{ color: '#F59E0B', fontSize: '14px' }} />
                  <span style={{ 
                    color: '#F59E0B',
                    fontWeight: '700',
                    fontSize: window.innerWidth < 768 ? '14px' : '15px'
                  }}>
                    {research.rating}
                  </span>
                  <span style={{ 
                    color: '#6BA3BE',
                    fontSize: window.innerWidth < 768 ? '13px' : '14px'
                  }}>
                    ({research.totalReviews} reviews)
                  </span>
                </div>
              </div>
              
              <p style={{ 
                color: '#6BA3BE',
                marginBottom: 0,
                fontSize: window.innerWidth < 768 ? '15px' : '16px',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <i className="fas fa-user-edit" style={{ fontSize: '14px' }}></i>
                {research.authors}
              </p>
            </div>
          </div>

          {/* Metadata Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: window.innerWidth < 768 ? '1fr' : 'repeat(2, 1fr)',
            gap: window.innerWidth < 768 ? '12px' : '16px',
            marginBottom: window.innerWidth < 768 ? '24px' : '32px'
          }}>
            {/* Department */}
            <div style={{
              background: 'rgba(12, 150, 156, 0.05)',
              border: '2px solid rgba(12, 150, 156, 0.15)',
              borderRadius: '12px',
              padding: window.innerWidth < 768 ? '16px' : '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <div style={{
                background: 'linear-gradient(135deg, #0C969C, #6BA3BE)',
                borderRadius: '10px',
                width: '44px',
                height: '44px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <i className="fas fa-building" style={{ color: 'white', fontSize: '18px' }}></i>
              </div>
              <div>
                <small style={{
                  color: '#6BA3BE',
                  fontSize: window.innerWidth < 768 ? '12px' : '13px',
                  fontWeight: '500',
                  display: 'block',
                  marginBottom: '2px'
                }}>
                  Department
                </small>
                <div style={{
                  color: '#0A7075',
                  fontSize: window.innerWidth < 768 ? '14px' : '16px',
                  fontWeight: '700'
                }}>
                  {research.department}
                </div>
              </div>
            </div>

            {/* Publication Year */}
            <div style={{
              background: 'rgba(12, 150, 156, 0.05)',
              border: '2px solid rgba(12, 150, 156, 0.15)',
              borderRadius: '12px',
              padding: window.innerWidth < 768 ? '16px' : '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <div style={{
                background: 'linear-gradient(135deg, #6BA3BE, #0A7075)',
                borderRadius: '10px',
                width: '44px',
                height: '44px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <FaCalendarAlt style={{ color: 'white', fontSize: '18px' }} />
              </div>
              <div>
                <small style={{
                  color: '#6BA3BE',
                  fontSize: window.innerWidth < 768 ? '12px' : '13px',
                  fontWeight: '500',
                  display: 'block',
                  marginBottom: '2px'
                }}>
                  Publication Year
                </small>
                <div style={{
                  color: '#0A7075',
                  fontSize: window.innerWidth < 768 ? '14px' : '16px',
                  fontWeight: '700'
                }}>
                  {research.year_publication}
                </div>
              </div>
            </div>

            {/* Location */}
            <div style={{
              background: 'rgba(12, 150, 156, 0.05)',
              border: '2px solid rgba(12, 150, 156, 0.15)',
              borderRadius: '12px',
              padding: window.innerWidth < 768 ? '16px' : '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <div style={{
                background: 'linear-gradient(135deg, #0A7075, #0C969C)',
                borderRadius: '10px',
                width: '44px',
                height: '44px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <FaMapMarkerAlt style={{ color: 'white', fontSize: '18px' }} />
              </div>
              <div>
                <small style={{
                  color: '#6BA3BE',
                  fontSize: window.innerWidth < 768 ? '12px' : '13px',
                  fontWeight: '500',
                  display: 'block',
                  marginBottom: '2px'
                }}>
                  Location
                </small>
                <div style={{
                  color: '#0A7075',
                  fontSize: window.innerWidth < 768 ? '14px' : '16px',
                  fontWeight: '700'
                }}>
                  {research.location}
                </div>
              </div>
            </div>

            {/* Type */}
            <div style={{
              background: 'rgba(12, 150, 156, 0.05)',
              border: '2px solid rgba(12, 150, 156, 0.15)',
              borderRadius: '12px',
              padding: window.innerWidth < 768 ? '16px' : '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <div style={{
                background: 'linear-gradient(135deg, #0C969C, #0A7075)',
                borderRadius: '10px',
                width: '44px',
                height: '44px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <FaFileAlt style={{ color: 'white', fontSize: '18px' }} />
              </div>
              <div>
                <small style={{
                  color: '#6BA3BE',
                  fontSize: window.innerWidth < 768 ? '12px' : '13px',
                  fontWeight: '500',
                  display: 'block',
                  marginBottom: '2px'
                }}>
                  Document Type
                </small>
                <div style={{
                  color: '#0A7075',
                  fontSize: window.innerWidth < 768 ? '14px' : '16px',
                  fontWeight: '700'
                }}>
                  Research Paper
                </div>
              </div>
            </div>
          </div>

          {/* Abstract Section */}
          <div style={{
            paddingTop: window.innerWidth < 768 ? '20px' : '28px',
            borderTop: '2px solid rgba(12, 150, 156, 0.1)',
            marginBottom: window.innerWidth < 768 ? '20px' : '28px'
          }}>
            <h5 style={{ 
              fontWeight: '700',
              marginBottom: '16px',
              color: '#0A7075',
              fontSize: window.innerWidth < 768 ? '18px' : '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <i className="fas fa-file-alt" style={{ fontSize: '18px', color: '#0C969C' }}></i>
              Abstract
            </h5>
            <p style={{
              color: '#6BA3BE',
              lineHeight: '1.8',
              fontSize: window.innerWidth < 768 ? '14px' : '16px',
              fontWeight: '400',
              marginBottom: 0,
              textAlign: 'justify'
            }}>
              {research.research_abstract || 'Abstract not available for this research paper.'}
            </p>
          </div>

          {/* Reviews Section */}
          {research.reviews && research.reviews.length > 0 && (
            <div style={{
              paddingTop: window.innerWidth < 768 ? '20px' : '28px',
              borderTop: '2px solid rgba(12, 150, 156, 0.1)'
            }}>
              <h5 style={{ 
                fontWeight: '700',
                marginBottom: '16px',
                color: '#0A7075',
                fontSize: window.innerWidth < 768 ? '18px' : '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <FaStar style={{ color: '#FFB800' }} />
                User Reviews ({research.totalReviews || research.reviews.length})
              </h5>

              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: window.innerWidth < 768 ? '12px' : '16px',
                maxHeight: window.innerWidth < 768 ? '320px' : '450px',
                overflowY: 'auto',
                paddingRight: '8px'
              }}>
                {research.reviews.map((review) => (
                  <div
                    key={review.rating_id}
                    style={{
                      background: 'rgba(255, 255, 255, 0.95)',
                      borderRadius: window.innerWidth < 768 ? '12px' : '14px',
                      padding: window.innerWidth < 768 ? '16px' : '20px',
                      border: '1px solid rgba(12, 150, 156, 0.1)',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      if (window.innerWidth >= 768) {
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(12, 150, 156, 0.15)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (window.innerWidth >= 768) {
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
                          fontSize: window.innerWidth < 768 ? '14px' : '16px',
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
                          fontSize: window.innerWidth < 768 ? '11px' : '12px',
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
                            size={window.innerWidth < 768 ? 12 : 14}
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
                        fontSize: window.innerWidth < 768 ? '13px' : '14px',
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
        </div>

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          gap: '12px',
          justifyContent: 'center'
        }}>
          <button 
            onClick={() => {
              const isReserved = research.status?.toLowerCase() === 'reserved';
              if (isReserved) return;
              
              const confirmReservation = window.confirm(
                `Are you sure you want to reserve this research paper?\n\n${research.research_title}\n\nYour reservation will be pending for approval.`
              );
              
              if (confirmReservation && onReserve) {
                onReserve(research.research_paper_id || research.id);
              }
            }}
            disabled={research.status?.toLowerCase() === 'reserved'}
            title={research.status?.toLowerCase() === 'reserved' ? 'This research paper is already reserved by another user' : 'Reserve this research paper'}
            style={{
              background: research.status?.toLowerCase() === 'reserved'
                ? 'linear-gradient(135deg, #8B5CF6, #A78BFA)'
                : 'linear-gradient(135deg, #0C969C, #6BA3BE)',
              border: 'none',
              borderRadius: '12px',
              padding: window.innerWidth < 768 ? '16px 40px' : '18px 48px',
              color: 'white',
              fontWeight: '700',
              fontSize: window.innerWidth < 768 ? '15px' : '16px',
              boxShadow: research.status?.toLowerCase() === 'reserved'
                ? '0 4px 16px rgba(139, 92, 246, 0.3)'
                : '0 4px 16px rgba(12, 150, 156, 0.3)',
              transition: 'all 0.3s ease',
              cursor: research.status?.toLowerCase() === 'reserved' ? 'not-allowed' : 'pointer',
              opacity: research.status?.toLowerCase() === 'reserved' ? 0.75 : 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              position: 'relative'
            }}
            onMouseEnter={(e) => {
              if (research.status?.toLowerCase() !== 'reserved') {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(12, 150, 156, 0.4)';
              }
            }}
            onMouseLeave={(e) => {
              if (research.status?.toLowerCase() !== 'reserved') {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(12, 150, 156, 0.3)';
              }
            }}
          >
            <i className="fas fa-bookmark" style={{ fontSize: '14px' }}></i>
            {research.status?.toLowerCase() === 'reserved' ? 'This Paper is Already Reserved' : 'Reserve This Paper'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResearchDetailModal;
