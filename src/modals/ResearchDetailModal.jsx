import React from 'react';
import { FaArrowLeft, FaStar, FaFileAlt, FaMapMarkerAlt, FaCalendarAlt, FaEye } from 'react-icons/fa';

const ResearchDetailModal = ({ research, onClose }) => {
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
        </div>

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          gap: '12px',
          flexDirection: window.innerWidth < 768 ? 'column' : 'row'
        }}>
          <button style={{
            flex: 1,
            background: 'linear-gradient(135deg, #0C969C, #6BA3BE)',
            border: 'none',
            borderRadius: '12px',
            padding: window.innerWidth < 768 ? '16px 24px' : '18px 32px',
            color: 'white',
            fontWeight: '700',
            fontSize: window.innerWidth < 768 ? '15px' : '16px',
            boxShadow: '0 4px 16px rgba(12, 150, 156, 0.3)',
            transition: 'all 0.3s ease',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 6px 20px rgba(12, 150, 156, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 4px 16px rgba(12, 150, 156, 0.3)';
          }}>
            <FaEye />
            Read Full Paper
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResearchDetailModal;
