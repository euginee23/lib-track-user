import React from 'react';
import { IoChatbubbleEllipsesOutline } from 'react-icons/io5';

const BotAvatar = () => {
  return (
    <div className="bot-avatar" style={{
      background: 'linear-gradient(135deg, #0A7075, #0C969C)',
      borderRadius: '50%',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      width: '42px',
      height: '42px',
      color: 'white',
      border: '2px solid rgba(255, 255, 255, 0.2)',
      boxShadow: '0 3px 8px rgba(10, 112, 117, 0.3)',
      position: 'relative',
      overflow: 'hidden',
      transition: 'all 0.3s ease'
    }}>
      <div className="bot-avatar-shimmer" />
      <IoChatbubbleEllipsesOutline size={22} style={{ zIndex: 1 }} />
    </div>
  );
};

export default BotAvatar;
