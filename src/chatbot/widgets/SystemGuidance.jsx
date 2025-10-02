import React from 'react';

const SystemGuidance = (props) => {
  const guidanceOptions = [
    {
      text: "How to Borrow Books",
      handler: () => props.actionProvider.handleSystemGuideSelection('borrowing'),
      id: 1,
      icon: "📖"
    },
    {
      text: "How to Return Books",
      handler: () => props.actionProvider.handleSystemGuideSelection('returning'),
      id: 2,
      icon: "↩️"
    },
    {
      text: "How to Search Books",
      handler: () => props.actionProvider.handleSystemGuideSelection('searching'),
      id: 3,
      icon: "🔍"
    },
    {
      text: "Manage Your Account",
      handler: () => props.actionProvider.handleSystemGuideSelection('account'),
      id: 4,
      icon: "👤"
    }
  ];

  return (
    <div className="system-guidance-container" style={{
      marginTop: '10px'
    }}>
      <div style={{
        display: 'grid',
        gap: '8px'
      }}>
        {guidanceOptions.map((option) => (
          <button
            key={option.id}
            onClick={option.handler}
            style={{
              backgroundColor: '#f8f9fa',
              color: '#0A7075',
              border: '1px solid #e0e0e0',
              borderRadius: '6px',
              padding: '12px',
              cursor: 'pointer',
              fontSize: '0.85rem',
              textAlign: 'left',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center'
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = '#0C969C';
              e.target.style.color = 'white';
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = '#f8f9fa';
              e.target.style.color = '#0A7075';
            }}
          >
            <span style={{ marginRight: '10px', fontSize: '1.1rem' }}>
              {option.icon}
            </span>
            {option.text}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SystemGuidance;