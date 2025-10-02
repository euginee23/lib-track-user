import React from 'react';

const BookSearch = (props) => {
  // These would normally be fetched from your API
  const bookCategories = [
    "Fiction",
    "Non-Fiction",
    "Academic",
    "Research Papers"
  ];

  const handleCategoryClick = (category) => {
    // Create and send a message through the action provider
    const message = props.actionProvider.createChatbotMessage(
      `Here are some ${category} books our library has. You can visit the Search Books page for more options.`
    );
    
    props.actionProvider.updateChatbotState(message);
  };

  return (
    <div className="book-search-widget">
      <p>Please select a category:</p>
      <div className="options-container" style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '10px',
        marginTop: '10px'
      }}>
        {bookCategories.map((category, index) => (
          <button 
            key={index}
            onClick={() => handleCategoryClick(category)}
            style={{
              backgroundColor: '#0C969C',
              color: 'white',
              border: 'none',
              borderRadius: '20px',
              padding: '8px 16px',
              cursor: 'pointer',
              fontSize: '0.9rem'
            }}
          >
            {category}
          </button>
        ))}
      </div>
    </div>
  );
};

export default BookSearch;