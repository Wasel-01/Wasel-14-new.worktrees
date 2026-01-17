/**
 * Firebase Configuration
 * 
 * Initialize Firebase for push notifications
 */

import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage, Messaging } from 'firebase/messaging';
import { supabase } from '../services/api';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
};

// Initialize Firebase
let app;
let messaging: Messaging | null = null;

try {
  app = initializeApp(firebaseConfig);
  
  // Only initialize messaging if supported
  if ('serviceWorker' in navigator && 'PushManager' in window) {
    messaging = getMessaging(app);
  }
} catch (error) {
  console.error('Firebase initialization error:', error);
}

/**
 * Request permission for push notifications
 */
export const requestNotificationPermission = async (): Promise<string | null> => {
  if (!messaging) {
    console.warn('Messaging not supported');
    return null;
  }

  try {
    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
      const token = await getToken(messaging, {
        vapidKey: process.env.REACT_APP_FIREBASE_VAPID_KEY,
      });
      
      console.log('FCM Token:', token);
      return token;
    } else {
      console.log('Notification permission denied');
      return null;
    }
  } catch (error) {
    console.error('Error getting notification permission:', error);
    return null;
  }
};

/**
 * Listen for foreground messages
 */
export const onMessageListener = () =>
  new Promise((resolve) => {
    if (!messaging) {
      return;
    }

    onMessage(messaging, (payload) => {
      console.log('Message received:', payload);
      resolve(payload);
    });
  });

/**
 * Initialize push notifications
 */
export const initializePushNotifications = async () => {
  try {
    // Register service worker
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
      console.log('Service Worker registered:', registration);
    }

    // Request permission
    const token = await requestNotificationPermission();
    
    if (token) {
      // Store token in database
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase
            .from('user_preferences')
            .upsert({
              user_id: user.id,
              fcm_token: token,
              updated_at: new Date().toISOString(),
            });
          console.log('Push notification token stored in profile');
        }
      } catch (error) {
        console.error('Failed to store FCM token:', error);
      }
      console.log('Push notification token obtained:', token);
    }

    return token;
  } catch (error) {
    console.error('Push notification initialization error:', error);
    return null;
  }
};

export { messaging };
export default app;
