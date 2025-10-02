import { createChatBotMessage } from 'react-chatbot-kit';
import React from 'react';

import BotAvatar from './components/BotAvatar';
import MainOptions from './widgets/MainOptions';
import BookAvailability from './widgets/BookAvailability';
import BookAvailabilityResult from './widgets/BookAvailabilityResult';
import SystemGuidance from './widgets/SystemGuidance';
import PersonalizedRecommendations from './widgets/PersonalizedRecommendations';
import DynamicFAQ from './widgets/DynamicFAQ';

const botName = 'LibTrack ChatBot';

const config = {
  initialMessages: [
    createChatBotMessage(`Hi! I'm ${botName}, your virtual library assistant. How can I help you today?`, {
      widget: 'mainOptions',
    }),
  ],
  botName: botName,
  customStyles: {
    botMessageBox: {
      backgroundColor: '#0A7075',
      borderRadius: '18px 18px 18px 4px',
      padding: '12px 16px',
      fontSize: '14px',
      lineHeight: '1.5',
      color: 'white',
      maxWidth: '280px',
      wordWrap: 'break-word',
      whiteSpace: 'pre-wrap',
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
      maxWidth: '280px',
      wordWrap: 'break-word',
      whiteSpace: 'pre-wrap',
    },
  },
  customComponents: {
    botAvatar: (props) => React.createElement(BotAvatar, props),
  },
  widgets: [
    {
      widgetName: 'mainOptions',
      widgetFunc: (props) => React.createElement(MainOptions, props),
      mapStateToProps: ['messages'],
    },
    {
      widgetName: 'bookAvailability',
      widgetFunc: (props) => React.createElement(BookAvailability, props),
      mapStateToProps: ['messages'],
    },
    {
      widgetName: 'bookAvailabilityResult',
      widgetFunc: (props) => React.createElement(BookAvailabilityResult, props),
      mapStateToProps: ['messages'],
    },
    {
      widgetName: 'systemGuidance',
      widgetFunc: (props) => React.createElement(SystemGuidance, props),
      mapStateToProps: ['messages'],
    },
    {
      widgetName: 'personalizedRecommendations',
      widgetFunc: (props) => React.createElement(PersonalizedRecommendations, props),
      mapStateToProps: ['messages'],
    },
    {
      widgetName: 'dynamicFAQ',
      widgetFunc: (props) => React.createElement(DynamicFAQ, props),
      mapStateToProps: ['messages'],
    },
  ],
};

export default config;