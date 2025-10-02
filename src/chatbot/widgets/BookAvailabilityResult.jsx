import React from 'react';

const BookAvailabilityResult = (props) => {
  const { bookTitle } = props.payload || {};
  
  // This would normally come from an API call
  const mockBookData = {
    title: bookTitle || "Sample Book",
    author: "Sample Author",
    availability: Math.random() > 0.3 ? "Available" : "Checked Out",
    copies: Math.floor(Math.random() * 5) + 1,
    location: "Section A, Shelf 12",
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString()
  };

  const isAvailable = mockBookData.availability === "Available";

  return (
    <div className="book-availability-result" style={{
      backgroundColor: '#f8f9fa',
      borderRadius: '8px',
      padding: '15px',
      marginTop: '10px',
      border: `2px solid ${isAvailable ? '#28a745' : '#dc3545'}`
    }}>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        marginBottom: '12px',
        color: isAvailable ? '#28a745' : '#dc3545'
      }}>
        <span style={{ fontSize: '1.2rem', marginRight: '8px' }}>
          {isAvailable ? '✅' : '❌'}
        </span>
        <strong style={{ fontSize: '0.9rem' }}>{mockBookData.availability}</strong>
      </div>
      
      <div style={{ marginBottom: '15px' }}>
        <h4 style={{ margin: '0 0 8px 0', color: '#0A7075', fontSize: '0.95rem' }}>
          {mockBookData.title}
        </h4>
        <div style={{ display: 'grid', gap: '4px' }}>
          <p style={{ margin: '0', fontSize: '0.8rem', color: '#555' }}>
            <strong>Author:</strong> {mockBookData.author}
          </p>
          <p style={{ margin: '0', fontSize: '0.8rem', color: '#555' }}>
            <strong>Location:</strong> {mockBookData.location}
          </p>
          <p style={{ margin: '0', fontSize: '0.8rem', color: '#555' }}>
            <strong>Copies:</strong> {isAvailable ? mockBookData.copies : 0}
          </p>
          {!isAvailable && (
            <p style={{ margin: '0', fontSize: '0.8rem', color: '#dc3545' }}>
              <strong>Expected Return:</strong> {mockBookData.dueDate}
            </p>
          )}
        </div>
      </div>
      
      {isAvailable && (
        <button
          onClick={() => {
            const message = props.actionProvider.createChatbotMessage(
              "To reserve this book, please visit the library kiosk or speak with a librarian."
            );
            props.actionProvider.updateChatbotState(message);
          }}
          style={{
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            padding: '10px 16px',
            cursor: 'pointer',
            fontSize: '0.8rem',
            fontWeight: '500',
            width: '100%'
          }}
        >
          Reserve This Book
        </button>
      )}
    </div>
  );
};

export default BookAvailabilityResult;