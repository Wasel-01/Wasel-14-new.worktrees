import { useState, useEffect } from 'react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { useAuth } from '../contexts/AuthContext';

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-0b1f4071`;

interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  trip_id?: string;
  content: string;
  read: boolean;
  created_at: string;
}

export function useRealMessages() {
  const { user, session } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = async (data: {
    recipient_id: string;
    trip_id?: string;
    content: string;
  }) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token || publicAnonKey}`,
        },
        body: JSON.stringify(data),
      });

      const responseData = await response.json();
      if (!response.ok) throw new Error(responseData.error || 'Failed to send message');

      return { success: true, message: responseData.message };
    } catch (err: any) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const getConversation = async (userId1: string, userId2: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `${API_BASE}/messages/conversation/${userId1}/${userId2}`,
        {
          headers: {
            'Authorization': `Bearer ${session?.access_token || publicAnonKey}`,
          },
        }
      );

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to fetch messages');

      setMessages(data.messages || []);
      return { success: true, messages: data.messages };
    } catch (err: any) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  return {
    messages,
    loading,
    error,
    sendMessage,
    getConversation,
  };
}
