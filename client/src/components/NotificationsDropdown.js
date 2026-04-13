import React, { useState, useEffect, useRef } from 'react';
import api from '../api';
import { Bell } from 'lucide-react';

export default function NotificationsDropdown({ align = 'bottom-right' }) {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/api/notifications');
      setNotifications(res.data);
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.put(`/api/notifications/${id}/read`);
      setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      console.error('Failed to mark read', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put('/api/notifications/read-all');
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error('Failed to mark all read', err);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div style={{ position: 'relative' }} ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        style={{ 
          background: 'transparent', border: 'none', cursor: 'pointer', padding: '0.4rem',
          position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-primary)'
        }}
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute', top: 0, right: 0, background: 'var(--error)', color: 'white',
            borderRadius: '50%', width: '16px', height: '16px', fontSize: '10px',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold'
          }}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div className={`notifications-popup align-${align}`}>
            <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '1rem' }}>Notifications</h3>
              {unreadCount > 0 && (
                <button onClick={markAllAsRead} style={{ background: 'transparent', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontSize: '0.85rem' }}>
                  Mark all read
                </button>
              )}
            </div>
            <div style={{ overflowY: 'auto', flex: 1 }}>
              {notifications.length === 0 ? (
                <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  No notifications
                </div>
              ) : (
                notifications.map(n => (
                  <div 
                    key={n._id} 
                    style={{ 
                      padding: '0.75rem 1rem', borderBottom: '1px solid var(--border)', cursor: 'pointer',
                      background: n.isRead ? 'transparent' : 'rgba(var(--accent-rgb), 0.05)',
                      transition: 'background 0.2s'
                    }}
                    onClick={() => !n.isRead && markAsRead(n._id)}
                  >
                    <p style={{ margin: 0, fontSize: '0.9rem', color: n.isRead ? 'var(--text-secondary)' : 'var(--text-primary)' }}>
                      {n.message}
                    </p>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {new Date(n.createdAt).toLocaleString()}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
          <style>{`
            .notifications-popup {
              position: absolute;
              width: 300px;
              background: var(--bg-card);
              border: 1px solid var(--border);
              border-radius: 8px;
              box-shadow: 0 4px 6px rgba(0,0,0,0.1);
              z-index: 1000;
              max-height: 400px;
              display: flex;
              flex-direction: column;
            }
            .align-bottom-right {
              top: 100%;
              right: 0;
              margin-top: 0.5rem;
            }
            .align-top {
              bottom: 100%;
              left: 50%;
              transform: translateX(-30%);
              margin-bottom: 0.5rem;
            }
            @media (max-width: 768px) {
              .notifications-popup {
                position: fixed !important;
                top: 70px !important;
                left: 5% !important;
                right: 5% !important;
                width: 90% !important;
                bottom: auto !important;
                max-height: 80vh !important;
                transform: none !important;
                margin: 0 !important;
              }
            }
          `}</style>
        </>
      )}
    </div>
  );
}
