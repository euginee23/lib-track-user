import React from 'react';

const MainOptions = (props) => {
  const options = [
    {
      text: "Book Availability",
      icon: "📚",
      handler: () => props.actionProvider.handleBookAvailability(),
      id: 1,
      description: "Check if books are available"
    },
    {
      text: "System Guidance",
      icon: "🧭",
      handler: () => props.actionProvider.handleSystemGuidance(),
      id: 2,
      description: "Learn how to use the library"
    },
    {
      text: "Recommendations",
      icon: "⭐",
      handler: () => props.actionProvider.handlePersonalizedRecommendations(),
      id: 3,
      description: "Get book suggestions"
    },
    {
      text: "FAQ",
      icon: "❓",
      handler: () => props.actionProvider.handleFAQ(),
      id: 4,
      description: "Common questions"
    }
  ];

  return (
    <div className="main-options-container">
      {options.map((option) => (
        <button
          key={option.id}
          onClick={option.handler}
          className="main-option-button"
          title={option.description}
        >
          <span className="main-option-icon">
            {option.icon}
          </span>
          <span className="main-option-text">
            {option.text}
          </span>
        </button>
      ))}
    </div>
  );
};

export default MainOptions;