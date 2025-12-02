import React from 'react';
import chatbotService from '../../api/chatbot/chatbotService';
import authService from '../utils/auth';
import CustomBotMessage from './components/CustomBotMessage';

class ActionProvider {
  constructor(createChatbotMessage, setStateFunc, createClientMessage) {
    this.createChatbotMessage = createChatbotMessage;
    this.setState = setStateFunc;
    this.createClientMessage = createClientMessage;
    
    // Simple response cache for performance
    this.responseCache = new Map();
    this.cacheExpiry = 5 * 60 * 1000; // 5 minutes
  }
  
  // Get user info helper
  getUserInfo() {
    let userInfo = {};
    try {
      const user = authService.getUser();
      if (user) {
        const firstName = user.first_name || user.firstName || user.name || 'User';
        
        userInfo = {
          userId: user.user_id || user.userId || user.id,
          userName: firstName,
          userRole: user.role || 'student'
        };
      }
    } catch (error) {
      console.log('Could not get user info:', error);
    }
    return userInfo;
  }

  // Main handler for all user messages
  async handleMessage(userMessage) {
    try {
      // Check cache first
      const cacheKey = `msg_${userMessage.toLowerCase().trim()}`;
      const cached = this.responseCache.get(cacheKey);
      if (cached && (Date.now() - cached.timestamp < this.cacheExpiry)) {
        this.updateChatbotState(this.createChatbotMessage(cached.data));
        return;
      }
      
      // Show typing indicator
      const typingMessage = this.createChatbotMessage('Thinking...');
      this.updateChatbotState(typingMessage);

      // Get user info
      const userInfo = this.getUserInfo();

      // Send to backend
      const response = await chatbotService.sendMessage(userMessage, userInfo);

      // Cache the response
      if (response && response.message) {
        this.responseCache.set(cacheKey, { 
          data: response.message, 
          timestamp: Date.now() 
        });
      }

      // Remove typing indicator and add response
      this.setState((prevState) => {
        const messages = prevState.messages.slice(0, -1); // Remove typing message
        
        // Create message with custom renderer for line breaks
        const botMessage = this.createChatbotMessage(
          React.createElement(CustomBotMessage, { message: response.message })
        );
        
        return {
          ...prevState,
          messages: [...messages, botMessage]
        };
      });

    } catch (error) {
      console.error('Error getting chatbot response:', error);
      
      // Remove typing indicator and show error
      this.setState((prevState) => {
        const messages = prevState.messages.slice(0, -1);
        return {
          ...prevState,
          messages: [
            ...messages,
            this.createChatbotMessage(
              "I'm sorry, I'm having trouble processing your request right now. Please try again."
            )
          ]
        };
      });
    }
  }

  // Handler for FAQ - shows FAQ widget
  handleFAQ() {
    const message = this.createChatbotMessage('Here are some frequently asked questions:', {
      widget: 'dynamicFAQ',
    });
    this.updateChatbotState(message);
  }

  updateChatbotState(message) {
    this.setState((prevState) => ({
      ...prevState,
      messages: [...prevState.messages, message],
    }));
  }
}

export default ActionProvider;