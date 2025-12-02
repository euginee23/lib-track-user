import React from 'react';

const CustomBotMessage = ({ message }) => {
  // Convert newlines to <br> tags for proper rendering
  const formatMessage = (text) => {
    if (!text) return null;
    
    // Split by newlines and map to React elements
    const lines = text.split('\n');
    
    return lines.map((line, index) => (
      <React.Fragment key={index}>
        {line}
        {index < lines.length - 1 && <br />}
      </React.Fragment>
    ));
  };

  return (
    <div style={{
      whiteSpace: 'normal',
      wordWrap: 'break-word',
      overflowWrap: 'break-word',
    }}>
      {formatMessage(message)}
    </div>
  );
};

export default CustomBotMessage;
