import { useState, useEffect, useRef } from "react";
import { FaBell, FaBook, FaExclamationTriangle, FaInfoCircle, FaCheckCircle } from 'react-icons/fa';
import WebSocketClient from "../../api/websockets/websocket-client";
import authService from "../utils/auth";
import { getNotifications } from "../../api/notifications/getNotifications";
import { deleteNotifications } from "../../api/notifications/deleteNotification";

const NotificationPopover = () => {
  const [show, setShow] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [hasNewNotification, setHasNewNotification] = useState(false);
  const [wsClient] = useState(() => {
    const client = new WebSocketClient();
    client.connect();
    return client;
  });
  const dropdownRef = useRef(null);
  const btnRef = useRef(null);
  const currentUserRef = useRef(null);

  // Map API notification object to UI shape used in this component
  function mapApiToUi(n) {
    const id = n.notification_id ?? n.id ?? n._id ?? n.id;
    const type = n.notification_type ?? n.type ?? n.category ?? 'system';
    const message = n.notification_message ?? n.message ?? n.body ?? '';
    const title = n.title ?? (type === 'system' ? 'System' : (n.summary ?? 'Notification'));
    const createdAt = n.created_at ?? n.createdAt ?? n.timestamp ?? n.ts ?? Date.now();

    return {
      id,
      type,
      title,
      message,
      timestamp: new Date(createdAt),
      read: !!n.read,
      icon: getIconForNotificationType(type),
      color: getColorForNotificationType(type),
      priority: n.priority || 'medium',
      user_id: n.user_id ?? n.userId ?? null
    };
  }

  // Mock notification data and WebSocket listener
  useEffect(() => {
    const currentUser = authService.getUser();
    
    let currentUserId = currentUser?.user_id || currentUser?.id;
    
    // If no user ID from stored user data, try to get from token
    if (!currentUserId) {
      const userFromToken = authService.getUserFromToken();
      if (userFromToken) {
        currentUserId = userFromToken.user_id || userFromToken.id || userFromToken.userId;
        console.log('Using user ID from token as fallback:', currentUserId);
      }
    }
    
    console.log('Final current user ID:', currentUserId);

    if (!currentUserId) {
      console.warn("No logged-in user found, notifications will not be filtered");
    }

    // store current user id for other handlers (clear all)
    currentUserRef.current = currentUserId;

    // Load notifications from API for the current user
    const loadNotifications = async (uid) => {
      try {
        if (!uid) {
          // If no user id available, fetch global/system notifications (omit filter)
          const data = await getNotifications({ page: 1, limit: 50 });
          const list = Array.isArray(data?.notifications) ? data.notifications : (Array.isArray(data) ? data : []);
          setNotifications(list.map(mapApiToUi));
          return;
        }

        const data = await getNotifications({ user_id: uid, page: 1, limit: 50 });
        const list = Array.isArray(data?.notifications) ? data.notifications : (Array.isArray(data) ? data : []);
        setNotifications(list.map(mapApiToUi));
      } catch (err) {
        console.error('User: Failed to load notifications', err?.message || err);
      }
    };

    loadNotifications(currentUserId);

    // Listen for real-time notifications from admin
    const handleUserNotification = (payload) => {
      console.log('📩 Received notification from admin:', payload);
      
      const isForCurrentUser = !payload.user_id || payload.user_id === currentUserId;
      const isSystemNotification = payload.type === 'system' || !payload.user_id;
      
      if (!isForCurrentUser && !isSystemNotification) {
        console.log('🚫 Notification not for current user, ignoring:', {
          notificationUserId: payload.user_id,
          currentUserId: currentUserId
        });
        return;
      }

      console.log('✅ Notification accepted for user:', currentUserId);
      
      // Create notification object from WebSocket payload
      const newNotification = {
        id: Date.now() + Math.random(), // Ensure unique ID
        type: payload.type || 'book_reminder',
        title: payload.title,
        message: payload.message,
        timestamp: new Date(payload.timestamp || Date.now()),
        read: false,
        icon: getIconForNotificationType(payload.type),
        color: getColorForNotificationType(payload.type),
        priority: payload.priority || 'medium',
        user_id: payload.user_id // Store user_id for reference
      };

      // Add to notifications list (prepend to show newest first)
      setNotifications(prev => [newNotification, ...prev]);
      
      // Trigger pulse animation for new notification
      setHasNewNotification(true);
      setTimeout(() => setHasNewNotification(false), 2000); // Reset after 2 seconds
      
      // Show browser notification if permission granted
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(payload.title, {
          body: payload.message,
          icon: '/wmsu_icon.ico',
          tag: `notification-${newNotification.id}`
        });
      }
    };

    // Request notification permission on first load
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        console.log('Notification permission:', permission);
      });
    }

    // Set up WebSocket listener
    wsClient.on('user_notification', handleUserNotification);

    // Cleanup function
    return () => {
      wsClient.off('user_notification', handleUserNotification);
      // Don't close WebSocket here - keep it open for the session
    };
  }, [wsClient]);

  // Cleanup WebSocket only when component unmounts permanently
  useEffect(() => {
    return () => {
      if (wsClient) {
        wsClient.close();
      }
    };
  }, []);

  // Helper function to get icon for notification type
  const getIconForNotificationType = (type) => {
    switch (type) {
      case 'book_reminder':
      case 'book_due':
        return FaBook;
      case 'overdue':
        return FaExclamationTriangle;
      case 'reservation_ready':
      case 'book_returned':
        return FaCheckCircle;
      case 'system':
      default:
        return FaInfoCircle;
    }
  };

  // Helper function to get color for notification type
  const getColorForNotificationType = (type) => {
    switch (type) {
      case 'book_reminder':
      case 'book_due':
        return '#f39c12';
      case 'overdue':
        return '#e74c3c';
      case 'reservation_ready':
      case 'book_returned':
        return '#27ae60';
      case 'system':
      default:
        return '#3498db';
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClick(e) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target) &&
        btnRef.current &&
        !btnRef.current.contains(e.target)
      ) {
        setShow(false);
      }
    }
    if (show) {
      document.addEventListener('mousedown', handleClick);
    } else {
      document.removeEventListener('mousedown', handleClick);
    }
    return () => document.removeEventListener('mousedown', handleClick);
  }, [show]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) {
      return `${minutes}m ago`;
    } else if (hours < 24) {
      return `${hours}h ago`;
    } else {
      return `${days}d ago`;
    }
  };

  const markAsRead = (id) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  const clearAll = async () => {
    try {
      const userId = currentUserRef.current;
      // If userId exists, request server to delete all notifications for this user
      if (userId) {
        await deleteNotifications({ user_id: userId });
      } else {
        // Fallback: attempt to delete via empty ids array (server may ignore)
        await deleteNotifications({ ids: notifications.map(n => n.id) });
      }
      setNotifications([]);
      setShow(false);
    } catch (err) {
      console.error('User: Failed to clear notifications', err?.message || err);
      // still clear UI to avoid blocking UX, but keep logs
      setNotifications([]);
      setShow(false);
    }
  };

  return (
    <>
      <style>
        {`
          .notification-bell {
            transition: all 0.3s ease;
          }
          
          .notification-bell.pulse {
            animation: pulse 0.8s ease-in-out 3;
          }
          
          @keyframes pulse {
            0% {
              transform: scale(1);
            }
            50% {
              transform: scale(1.05);
              filter: brightness(1.2);
            }
            100% {
              transform: scale(1);
            }
          }
          
          .notification-badge {
            animation: fadeIn 0.3s ease-in-out;
          }
          
          @keyframes fadeIn {
            0% {
              opacity: 0;
              transform: scale(0.5);
            }
            100% {
              opacity: 1;
              transform: scale(1);
            }
          }
          
          .notification-ring {
            transition: all 0.3s ease;
          }
          
          .notification-ring.pulse {
            border-color: rgba(255, 193, 7, 0.6) !important;
            box-shadow: 0 0 15px rgba(255, 193, 7, 0.3);
          }
        `}
      </style>
      <div className="position-relative">
        <button
          ref={btnRef}
          className={`btn position-relative p-0 notification-bell ${hasNewNotification ? 'pulse' : ''}`}
          style={{
            backgroundColor: 'transparent',
            border: 'none',
            color: 'white',
            borderRadius: '50%',
            width: '44px',
            height: '44px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginLeft: '8px', // spacing from welcome text
            boxSizing: 'border-box'
          }}
          onClick={() => setShow(!show)}
          aria-label="Notifications"
        >
          {/* outer ring */}
          <div className={`notification-ring ${hasNewNotification ? 'pulse' : ''}`} style={{
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            border: '2px solid rgba(255,255,255,0.18)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(255,255,255,0.02)'
          }}>
            <FaBell style={{ fontSize: '1.05rem' }} />
          </div>

          {unreadCount > 0 && (
            <span
              // small badge that slightly overlaps the ring
              style={{
                position: 'absolute',
                top: '-4px',
                right: '-2px',
                backgroundColor: '#e74c3c',
                color: 'white',
                fontSize: '0.6rem',
                minWidth: '18px',
                height: '18px',
                lineHeight: '18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '50%',
                padding: '0 4px',
                border: '2px solid rgba(3,47,48,0.9)',
                boxSizing: 'border-box',
                boxShadow: '0 1px 0 rgba(0,0,0,0.12)'
              }}
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>

      <div
        ref={dropdownRef}
        className={`dropdown-menu${show ? ' show' : ''}`}
        style={{
          position: 'absolute',
          top: '48px',
          right: '8px',
          width: '350px',
          maxHeight: '400px',
          overflowY: 'auto',
          background: 'rgba(255,255,255,0.98)',
          borderRadius: '12px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
          border: 'none',
          padding: '0',
          zIndex: 1200,
          display: show ? 'block' : 'none'
        }}
      >
        {/* Header */}
        <div
          className="d-flex justify-content-between align-items-center p-3 border-bottom"
          style={{ borderColor: '#e9ecef !important' }}
        >
          <h6 className="mb-0" style={{ color: '#031716', fontWeight: '600' }}>
            Notifications
          </h6>
          {unreadCount > 0 && (
            <button
              className="btn btn-sm"
              style={{
                color: '#0C969C',
                backgroundColor: 'transparent',
                border: 'none',
                fontSize: '0.75rem',
                padding: '2px 8px'
              }}
              onClick={markAllAsRead}
            >
              Mark all read
            </button>
          )}
        </div>

        {/* Notifications List */}
        <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
          {notifications.length === 0 ? (
            <div className="text-center py-4" style={{ color: '#6c757d' }}>
              <FaBell style={{ fontSize: '2rem', opacity: '0.5', marginBottom: '10px' }} />
              <p className="mb-0" style={{ fontSize: '0.85rem' }}>No notifications</p>
            </div>
          ) : (
            notifications.map((notification) => {
              const IconComponent = notification.icon;
              return (
                <div
                  key={notification.id}
                  className={`p-3 border-bottom notification-item ${!notification.read ? 'unread' : ''}`}
                  style={{
                    borderColor: '#f8f9fa !important',
                    backgroundColor: notification.read ? 'transparent' : 'rgba(12, 150, 156, 0.05)',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s ease'
                  }}
                  onClick={() => markAsRead(notification.id)}
                  onMouseEnter={(e) => {
                    e.target.closest('.notification-item').style.backgroundColor = 'rgba(12, 150, 156, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.closest('.notification-item').style.backgroundColor = 
                      notification.read ? 'transparent' : 'rgba(12, 150, 156, 0.05)';
                  }}
                >
                  <div className="d-flex">
                    <div className="me-3 mt-1">
                      <IconComponent
                        style={{
                          color: notification.color,
                          fontSize: '1.1rem'
                        }}
                      />
                    </div>
                    <div className="flex-grow-1">
                      <div className="d-flex justify-content-between align-items-start mb-1">
                        <h6
                          className="mb-0"
                          style={{
                            fontSize: '0.8rem',
                            fontWeight: notification.read ? '500' : '600',
                            color: '#031716'
                          }}
                        >
                          {notification.title}
                        </h6>
                        <small
                          style={{
                            fontSize: '0.7rem',
                            color: '#6c757d',
                            whiteSpace: 'nowrap',
                            marginLeft: '8px'
                          }}
                        >
                          {formatTimeAgo(notification.timestamp)}
                        </small>
                      </div>
                      <p
                        className="mb-0"
                        style={{
                          fontSize: '0.75rem',
                          color: '#495057',
                          lineHeight: '1.3',
                          opacity: notification.read ? '0.8' : '1'
                        }}
                      >
                        {notification.message}
                      </p>
                      {!notification.read && (
                        <div
                          className="mt-1"
                          style={{
                            width: '6px',
                            height: '6px',
                            backgroundColor: '#0C969C',
                            borderRadius: '50%',
                            display: 'inline-block'
                          }}
                        />
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <div
            className="p-2 text-center border-top"
            style={{ borderColor: '#e9ecef !important' }}
          >
            <button
              className="btn btn-sm w-100"
              style={{
                color: '#6c757d',
                backgroundColor: 'transparent',
                border: 'none',
                fontSize: '0.75rem'
              }}
              onClick={clearAll}
            >
              Clear all notifications
            </button>
          </div>
        )}
      </div>
    </div>
    </>
  );
};

export default NotificationPopover;