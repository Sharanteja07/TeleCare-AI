import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, Info, AlertCircle, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import httpClient from '../services/httpClient';
import { useAuth } from '../context/AuthContext';

export const NotificationPanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const panelRef = useRef(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    fetchNotifications();

    const handleClickOutside = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await httpClient.get('/api/notifications');
      if (res.data) {
        setNotifications(res.data);
        setUnreadCount(res.data.filter(n => !n.is_read).length);
      }
    } catch (error) {
      console.error('Failed to fetch notifications', error);
    }
  };

  const markAllRead = async () => {
    try {
      await httpClient.put('/api/notifications/read-all');
      setNotifications(notifications.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all as read', error);
    }
  };

  const markRead = async (id) => {
    try {
      await httpClient.put(`/api/notifications/${id}/read`);
      setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark as read', error);
    }
  };

  const handleNotificationClick = (notification) => {
    if (!notification.is_read) {
      markRead(notification.id);
    }
    setIsOpen(false);
    
    if (notification.ticket_id) {
      const role = user?.role || 'customer';
      navigate(`/${role}/tickets/${notification.ticket_id}`);
    }
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  const getIcon = (type) => {
    switch(type) {
      case 'status_update': return <Info size={16} className="text-color-primary" />;
      case 'new_message': return <MessageSquare size={16} className="text-color-success" />;
      case 'alert': return <AlertCircle size={16} className="text-color-warning" />;
      default: return <Bell size={16} className="text-text-secondary" />;
    }
  };

  return (
    <div className="relative" ref={panelRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full text-text-secondary hover:bg-bg-sidebar transition-colors focus:outline-none"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-color-danger text-[10px] font-bold text-white ring-2 ring-bg-app">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-bg-card border border-border-dim rounded-xl shadow-xl z-50 overflow-hidden transform origin-top-right transition-all">
          <div className="px-4 py-3 border-b border-border-dim bg-bg-sidebar flex items-center justify-between">
            <h3 className="font-semibold text-text-primary">Notifications</h3>
            {unreadCount > 0 && (
              <button 
                onClick={markAllRead}
                className="text-xs text-color-primary hover:text-blue-400 font-medium flex items-center gap-1"
              >
                <Check size={14} />
                Mark all read
              </button>
            )}
          </div>
          
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-text-secondary text-sm">
                No new notifications
              </div>
            ) : (
              <div className="divide-y divide-border-dim">
                {notifications.map((notif) => (
                  <div 
                    key={notif.id}
                    onClick={() => handleNotificationClick(notif)}
                    className={`px-4 py-3 hover:bg-bg-sidebar transition-colors cursor-pointer ${notif.is_read ? 'opacity-75' : 'bg-bg-app/30'}`}
                  >
                    <div className="flex gap-3">
                      <div className="mt-1 shrink-0">
                        {getIcon(notif.type)}
                      </div>
                      <div className="flex-1">
                        <p className={`text-sm ${notif.is_read ? 'text-text-secondary' : 'text-text-primary font-medium'}`}>
                          {notif.title}
                        </p>
                        <p className="text-xs text-text-secondary mt-0.5 line-clamp-2">
                          {notif.message}
                        </p>
                        <p className="text-[10px] text-text-secondary mt-1">
                          {formatTimeAgo(notif.created_at)}
                        </p>
                      </div>
                      {!notif.is_read && (
                        <div className="w-2 h-2 rounded-full bg-color-primary mt-1.5 shrink-0"></div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationPanel;
