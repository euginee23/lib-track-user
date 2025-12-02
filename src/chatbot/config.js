import { createChatBotMessage } from 'react-chatbot-kit';
import React from 'react';

import BotAvatar from './components/BotAvatar';
import DynamicFAQ from './widgets/DynamicFAQ';

const botName = 'LibTrack ChatBot';

const config = {
  initialMessages: [
    createChatBotMessage(`Hi! I'm ${botName}, your virtual library assistant. How can I help you today?`, {
      widget: 'dynamicFAQ',
    }),
  ],
  botName: botName,
  customStyles: {
    botMessageBox: {
      backgroundColor: '#0A7075',
      borderRadius: '18px 18px 18px 4px',
      padding: '14px 18px',
      fontSize: '13.5px',
      lineHeight: '1.6',
      color: 'white',
      maxWidth: '85%',
      wordWrap: 'break-word',
      whiteSpace: 'pre-wrap',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    },
    chatButton: {
      backgroundColor: '#0C969C',
      borderRadius: '25px',
      padding: '10px 20px',
      fontSize: '14px',
      fontWeight: '600',
      border: 'none',
      color: 'white',
    },
    userMessageBox: {
      backgroundColor: '#f1f3f4',
      color: '#333',
      borderRadius: '18px 18px 4px 18px',
      padding: '12px 16px',
      fontSize: '14px',
      lineHeight: '1.5',
      maxWidth: '75%',
      wordWrap: 'break-word',
      whiteSpace: 'pre-wrap',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    },
  },
  customComponents: {
    botAvatar: (props) => React.createElement(BotAvatar, props),
  },
  widgets: [
    {
      widgetName: 'dynamicFAQ',
      widgetFunc: (props) => React.createElement(DynamicFAQ, props),
      mapStateToProps: ['messages'],
    },
  ],
};

export default config;