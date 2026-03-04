import { initializeApp, getApps } from 'firebase/app';
import { getMessaging, onMessage, isSupported } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
};

// Safely initialize Firebase — avoid crashing the entire app if env vars are missing
let app: ReturnType<typeof initializeApp> | null = null;
try {
  app = getApps().length > 0 ? getApps()[0] : initializeApp(firebaseConfig);
} catch (e) {
  // eslint-disable-next-line no-console
  console.warn('[Firebase] Failed to initialize app. Push notifications will be disabled.', e);
}

export async function getFcmMessaging() {
  if (!app) return null;
  const supported = await isSupported().catch(() => false);
  if (!supported) return null;
  return getMessaging(app);
}

export default app;

// Register a foreground message handler that logs and displays notifications
export async function registerOnMessageHandler() {
  try {
    if (!app) return;
    const supported = await isSupported().catch(() => false);
    if (!supported) return;
    const messaging = getMessaging(app);
    onMessage(messaging, (payload) => {
      try {
        // eslint-disable-next-line no-console
        console.log('[FCM] foreground payload:', payload);
        const notification = payload.notification || payload.data || {};
        const title = notification.title || 'AI Dev Community';
        const options: any = {
          body: notification.body || '',
          icon: (notification && notification.icon) || '/logo.png',
          data: (payload && payload.data) || {},
        };

        // Show a notification even when page is focused
        if (Notification.permission === 'granted') {
          // If service worker is available, use it to show notification
          if (navigator.serviceWorker && navigator.serviceWorker.controller) {
            navigator.serviceWorker.getRegistration().then((reg) => {
              if (reg && reg.showNotification) return reg.showNotification(title, options);
              // Fallback to Notification API
              try { new Notification(title, options); } catch (e) {}
            }).catch(() => {
              try { new Notification(title, options); } catch (e) {}
            });
          } else {
            try { new Notification(title, options); } catch (e) {}
          }
        }

        // Dispatch a custom event so the app can show the full content in its modal
        try {
          const detail = { type: 'fcm-notification', title, body: options.body, data: options.data };
          window.dispatchEvent(new CustomEvent('fcm-notification', { detail }));
        } catch (e) {
          // eslint-disable-next-line no-console
          console.warn('Failed to dispatch fcm-notification event', e);
        }
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('[FCM] onMessage handler error', e);
      }
    });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('Failed to register onMessage handler', e);
  }
}
