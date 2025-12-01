import React, { useState, useCallback, useEffect } from 'react';
import { Chatbot } from 'react-chatbot-kit';
import 'react-chatbot-kit/build/main.css';
import './ChatbotStyles.css';
import { IoClose, IoChatbubbleEllipsesOutline } from 'react-icons/io5';

// Import directly without JSX extensions in the imports
import config from './config';
import MessageParser from './MessageParser';
import ActionProvider from './ActionProvider';
import chatbotService from '../../api/chatbot/chatbotService';

const ChatbotComponent = () => {
  const [showBot, setShowBot] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  const toggleBot = useCallback(() => {
    setShowBot(prev => !prev);
  }, []);
  
  // Perform health check when component mounts and periodically
  useEffect(() => {
    const checkHealth = async () => {
      const online = await chatbotService.performHealthCheck();
      setIsOnline(online);
    };
    
    checkHealth();
    
    // Check health every 2 minutes
    const interval = setInterval(checkHealth, 120000);
    
    return () => clearInterval(interval);
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
          {!isOnline && (
            <div style={{
              position: 'absolute',
              top: '10px',
              right: '10px',
              background: '#ff6b6b',
              color: 'white',
              padding: '5px 10px',
              borderRadius: '5px',
              fontSize: '12px'
            }}>
              ⚠️ AI Service Offline
            </div>
          )}
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