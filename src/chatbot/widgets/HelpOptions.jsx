import React from 'react';

const HelpOptions = (props) => {
  const options = [
    {
      text: "Search Books",
      handler: () => props.actionProvider.handleBookSearch(),
      id: 1
    },
    {
      text: "Borrowing Info",
      handler: () => props.actionProvider.handleBorrowInfo(),
      id: 2
    },
    {
      text: "Library Hours",
      handler: () => props.actionProvider.handleLibraryHours(),
      id: 3
    }
  ];

  return (
    <div className="help-options-container" style={{
      display: 'flex',
      flexWrap: 'wrap',
      gap: '10px',
      marginTop: '10px'
    }}>
      {options.map((option) => (
        <button
          key={option.id}
          onClick={option.handler}
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
          {option.text}
        </button>
      ))}
    </div>
  );
};

export default HelpOptions;