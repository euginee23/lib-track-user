import React from 'react';

const PersonalizedRecommendations = (props) => {
  // This would normally come from an API that analyzes user's reading history
  const recommendations = [
    {
      title: "The Silent Patient",
      author: "Alex Michaelides",
      genre: "Thriller",
      available: true
    },
    {
      title: "Educated",
      author: "Tara Westover", 
      genre: "Memoir",
      available: true
    },
    {
      title: "The Seven Husbands of Evelyn Hugo",
      author: "Taylor Jenkins Reid",
      genre: "Fiction",
      available: false
    }
  ];

  const handleBookClick = (book) => {
    props.actionProvider.handleSpecificBookSearch(book.title);
  };

  return (
    <div className="personalized-recommendations" style={{
      marginTop: '10px'
    }}>
      <div style={{ marginBottom: '12px' }}>
        <p style={{ margin: '0 0 8px 0', fontSize: '0.85rem', color: '#666' }}>
          Based on trending books and user preferences:
        </p>
      </div>
      
      <div style={{ display: 'grid', gap: '8px' }}>
        {recommendations.map((book, index) => (
          <div
            key={index}
            onClick={() => handleBookClick(book)}
            style={{
              backgroundColor: '#f8f9fa',
              borderRadius: '6px',
              padding: '12px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              border: '1px solid #e0e0e0'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#0C969C';
              e.currentTarget.style.color = 'white';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = '#f8f9fa';
              e.currentTarget.style.color = 'inherit';
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ flex: 1 }}>
                <h5 style={{ margin: '0 0 3px 0', fontSize: '0.85rem', fontWeight: '600' }}>
                  {book.title}
                </h5>
                <p style={{ margin: '0', fontSize: '0.75rem', opacity: 0.8 }}>
                  by {book.author} • {book.genre}
                </p>
              </div>
              <div style={{ 
                fontSize: '0.7rem', 
                padding: '3px 6px', 
                borderRadius: '10px',
                backgroundColor: book.available ? 'rgba(40, 167, 69, 0.1)' : 'rgba(220, 53, 69, 0.1)',
                color: book.available ? '#28a745' : '#dc3545',
                fontWeight: '500'
              }}>
                {book.available ? '✓' : '✗'}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PersonalizedRecommendations;