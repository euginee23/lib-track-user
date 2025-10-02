import React, { useState } from 'react';

const BookAvailability = (props) => {
  const [searchInput, setSearchInput] = useState('');

  const handleSearch = () => {
    if (searchInput.trim()) {
      props.actionProvider.handleSpecificBookSearch(searchInput.trim());
      setSearchInput('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const popularBooks = [
    "To Kill a Mockingbird",
    "1984", 
    "The Great Gatsby"
  ];

  return (
    <div className="book-availability-widget" style={{
      marginTop: '10px'
    }}>
      <div style={{ marginBottom: '15px' }}>
        <div style={{ 
          display: 'flex', 
          gap: '8px',
          marginBottom: '12px'
        }}>
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Enter book title or author..."
            style={{
              flex: 1,
              padding: '10px 12px',
              border: '1px solid #ddd',
              borderRadius: '6px',
              fontSize: '0.85rem',
              outline: 'none'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#0C969C';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#ddd';
            }}
          />
          <button
            onClick={handleSearch}
            style={{
              backgroundColor: '#0C969C',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              padding: '10px 16px',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: '500'
            }}
          >
            Search
          </button>
        </div>
      </div>
      
      <div>
        <p style={{ 
          marginBottom: '8px', 
          fontSize: '0.85rem',
          color: '#666',
          fontWeight: '500'
        }}>
          Or try these popular books:
        </p>
        <div style={{ 
          display: 'flex', 
          flexWrap: 'wrap',
          gap: '6px'
        }}>
          {popularBooks.map((book, index) => (
            <button
              key={index}
              onClick={() => props.actionProvider.handleSpecificBookSearch(book)}
              style={{
                backgroundColor: '#f1f3f4',
                color: '#0A7075',
                border: '1px solid #e0e0e0',
                borderRadius: '16px',
                padding: '6px 12px',
                cursor: 'pointer',
                fontSize: '0.8rem',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={(e) => {
                e.target.style.backgroundColor = '#0C969C';
                e.target.style.color = 'white';
              }}
              onMouseOut={(e) => {
                e.target.style.backgroundColor = '#f1f3f4';
                e.target.style.color = '#0A7075';
              }}
            >
              {book}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BookAvailability;