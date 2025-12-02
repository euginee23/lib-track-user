import React, { useState, useCallback } from 'react';
import { Chatbot } from 'react-chatbot-kit';
import 'react-chatbot-kit/build/main.css';
import './ChatbotStyles.css';
import { IoClose, IoChatbubbleEllipsesOutline } from 'react-icons/io5';

// Import directly without JSX extensions in the imports
import config from './config';
import MessageParser from './MessageParser';
import ActionProvider from './ActionProvider';

const ChatbotComponent = () => {
  const [showBot, setShowBot] = useState(false);

  const toggleBot = useCallback(() => {
    setShowBot(prev => !prev);
  }, []);

  return (
    <div className="chatbot-container">
      {showBot && (
        <div className="chatbot-wrapper">
          <Chatbot
            config={config}
            messageParser={MessageParser}
            actionProvider={ActionProvider}
          />
        </div>
      )}
      <button
        onClick={toggleBot}
        className="chatbot-toggle-button"
        aria-label={showBot ? 'Close chat' : 'Open chat'}
      >
        {showBot ? <IoClose size={24} /> : <IoChatbubbleEllipsesOutline size={24} />}
      </button>
    </div>
  );
};

export default React.memo(ChatbotComponent);