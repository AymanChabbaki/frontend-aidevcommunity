import { getToken } from 'firebase/messaging';
import { getFcmMessaging } from './firebase';

const VAPID_KEY = import.meta.env.VITE_FCM_VAPID_KEY || '';
const BACKEND_API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function timeoutPromise<T>(p: Promise<T>, ms = 8000, onTimeout?: () => void) {
  let id: ReturnType<typeof setTimeout>;
  const t = new Promise<T>((_res, rej) => {
    id = setTimeout(() => {
      if (onTimeout) onTimeout();
      rej(new Error('timeout'));
    }, ms);
  });
  return Promise.race([p, t]).finally(() => clearTimeout(id));
}

export async function requestPermissionAndRegisterToken(userId?: string) {
  if (!('Notification' in window)) {
    // eslint-disable-next-line no-console
    console.log('Notifications not supported in this browser');
    return null;
  }

  // Basic feature checks for push support. Safari historically had different
  // push requirements; detect lack of PushManager and bail early to avoid long waits.
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    // eslint-disable-next-line no-console
    console.log('Push not supported (serviceWorker or PushManager missing)');
    return null;
  }

  // Request permission first (must be a user gesture). If denied, stop early.
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') return null;

  const messaging = getFcmMessaging();
  try {
    // Try to get an existing registration for our SW, otherwise register it ourselves.
    let swRegistration: ServiceWorkerRegistration | undefined;
    try {
      swRegistration = await navigator.serviceWorker.getRegistration();
      if (!swRegistration) {
        // Register the firebase-messaging SW file from public folder
        // (Vite serves files from /).
        swRegistration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
      }
    } catch (swErr) {
      // eslint-disable-next-line no-console
      console.warn('Service worker registration failed', swErr);
    }

    // `getToken` can sometimes hang in flaky environments; add a timeout.
    const token = await timeoutPromise(
      getToken(messaging, { vapidKey: VAPID_KEY, serviceWorkerRegistration: swRegistration }),
      8000,
      () => {
        // eslint-disable-next-line no-console
        console.warn('getToken timed out');
      }
    );

    if (!token) return null;

    // Debug log the token
    // eslint-disable-next-line no-console
    console.log('FCM token acquired:', token);

    // Send to backend (best-effort)
    fetch(`${BACKEND_API}/fcm/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, userId, platform: 'web' }),
    }).catch((e) => {
      // eslint-disable-next-line no-console
      console.warn('Failed to POST token to backend', e);
    });

    return token;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Failed to get or register FCM token', err);
    return null;
  }
}
