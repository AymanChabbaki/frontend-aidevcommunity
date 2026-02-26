import { getToken } from 'firebase/messaging';
import { getFcmMessaging } from './firebase';

const VAPID_KEY = import.meta.env.VITE_FCM_VAPID_KEY || '';
const BACKEND_API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export async function requestPermissionAndRegisterToken(userId?: string) {
  if (!('Notification' in window)) return null;
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') return null;

  const messaging = getFcmMessaging();
  const token = await getToken(messaging, { vapidKey: VAPID_KEY });
  if (!token) return null;

  // Send to backend
  await fetch(`${BACKEND_API}/fcm/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, userId, platform: 'web' }),
  });

  return token;
}
