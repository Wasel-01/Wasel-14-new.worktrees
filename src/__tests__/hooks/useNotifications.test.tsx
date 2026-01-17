import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import React from 'react';

// Mock Notifications Hook
function useNotifications(userId: string) {
    const [notifications, setNotifications] = React.useState<any[]>([]);
    const [unreadCount, setUnreadCount] = React.useState(0);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        setTimeout(() => {
            const mockNotifications = [
                { id: 'n1', type: 'booking', message: 'New booking request', read: false, createdAt: new Date() },
                { id: 'n2', type: 'trip', message: 'Trip starting soon', read: false, createdAt: new Date() },
                { id: 'n3', type: 'message', message: 'New message received', read: true, createdAt: new Date() },
            ];
            setNotifications(mockNotifications);
            setUnreadCount(mockNotifications.filter(n => !n.read).length);
            setLoading(false);
        }, 100);
    }, [userId]);

    const markAsRead = (notificationId: string) => {
        setNotifications(prev =>
            prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
    };

    const markAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        setUnreadCount(0);
    };

    const dismiss = (notificationId: string) => {
        const notification = notifications.find(n => n.id === notificationId);
        setNotifications(prev => prev.filter(n => n.id !== notificationId));
        if (notification && !notification.read) {
            setUnreadCount(prev => Math.max(0, prev - 1));
        }
    };

    const clearAll = () => {
        setNotifications([]);
        setUnreadCount(0);
    };

    return { notifications, unreadCount, loading, markAsRead, markAllAsRead, dismiss, clearAll };
}

describe('useNotifications Hook', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should initialize with loading state', () => {
        const { result } = renderHook(() => useNotifications('user123'));
        expect(result.current.loading).toBe(true);
    });

    it('should load notifications', async () => {
        const { result } = renderHook(() => useNotifications('user123'));

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.notifications).toHaveLength(3);
    });

    it('should calculate unread count correctly', async () => {
        const { result } = renderHook(() => useNotifications('user123'));

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.unreadCount).toBe(2);
    });

    it('should mark notification as read', async () => {
        const { result } = renderHook(() => useNotifications('user123'));

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        act(() => {
            result.current.markAsRead('n1');
        });

        const notification = result.current.notifications.find(n => n.id === 'n1');
        expect(notification?.read).toBe(true);
        expect(result.current.unreadCount).toBe(1);
    });

    it('should mark all notifications as read', async () => {
        const { result } = renderHook(() => useNotifications('user123'));

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        act(() => {
            result.current.markAllAsRead();
        });

        expect(result.current.unreadCount).toBe(0);
        expect(result.current.notifications.every(n => n.read)).toBe(true);
    });

    it('should dismiss a notification', async () => {
        const { result } = renderHook(() => useNotifications('user123'));

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        const initialCount = result.current.notifications.length;

        act(() => {
            result.current.dismiss('n1');
        });

        expect(result.current.notifications.length).toBe(initialCount - 1);
        expect(result.current.unreadCount).toBe(1);
    });

    it('should clear all notifications', async () => {
        const { result } = renderHook(() => useNotifications('user123'));

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        act(() => {
            result.current.clearAll();
        });

        expect(result.current.notifications).toHaveLength(0);
        expect(result.current.unreadCount).toBe(0);
    });
});
