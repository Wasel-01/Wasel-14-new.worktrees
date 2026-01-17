import { useState, useEffect } from 'react';
import { notificationsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

// Mock type
export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  data?: any;
  read: boolean;
  created_at: string;
}

export function useNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchNotifications();
      // Polling for notifications since realtime isn't supported on KV
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchNotifications = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const response = await notificationsAPI.getNotifications();
      const data = response.notifications || [];

      setNotifications(data);
      setUnreadCount(data.filter((n: Notification) => !n.read).length || 0);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await notificationsAPI.markAsRead(notificationId);

      setNotifications(prev =>
        prev.map(n => (n.id === notificationId ? { ...n, read: true } : n))
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;

    try {
        // Inefficient but works given current API limitations
        const unread = notifications.filter(n => !n.read);
        await Promise.all(unread.map(n => notificationsAPI.markAsRead(n.id)));

      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  };

  const deleteNotification = async (notificationId: string) => {
     // Not supported by API yet
     console.warn('deleteNotification not supported');
  };

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refresh: fetchNotifications,
  };
}
