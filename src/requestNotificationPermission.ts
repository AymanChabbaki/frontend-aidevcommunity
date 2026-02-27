import { getToken } from 'firebase/messaging';
import { getFcmMessaging } from './firebase';

const VAPID_KEY = import.meta.env.VITE_FCM_VAPID_KEY || '';
const BACKEND_API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export async function requestPermissionAndRegisterToken(userId?: string) {
  if (!('Notification' in window)) return null;
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') return null;

  const messaging = getFcmMessaging();
  try {
    // Ensure the service worker is ready and pass the registration to getToken.
    // This avoids issues where the messaging service worker isn't yet active
    // and `getToken` would return null.
    let swRegistration: ServiceWorkerRegistration | undefined;
    if ('serviceWorker' in navigator) {
      swRegistration = await navigator.serviceWorker.ready;
    }
    const token = await getToken(messaging, { vapidKey: VAPID_KEY, serviceWorkerRegistration: swRegistration });
    if (!token) return null;

    // Helpful debug log for DevTools.
    // eslint-disable-next-line no-console
    console.log('FCM token acquired:', token);

    // Send to backend
    await fetch(`${BACKEND_API}/fcm/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, userId, platform: 'web' }),
    });

    return token;
  } catch (err) {
    // Surface errors to console for easier debugging in DevTools.
    // Do not throw to avoid breaking app flow.
    // eslint-disable-next-line no-console
    console.error('Failed to get or register FCM token', err);
    return null;
  }
}
