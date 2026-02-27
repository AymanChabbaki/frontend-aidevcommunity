importScripts('https://www.gstatic.com/firebasejs/9.21.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.21.0/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: 'AIzaSyB9js6nWKtBYRrK-3RVSMyVyuCOQdVgp9o',
  authDomain: 'aidev-837b9.firebaseapp.com',
  projectId: 'aidev-837b9',
  storageBucket: 'aidev-837b9.firebasestorage.app',
  messagingSenderId: '521353797237',
  appId: '1:521353797237:web:3d5437f0a43e1e57f7623c',
  measurementId: 'G-RS4YP0RTP0'
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  // Log payload for debugging in SW console
  try {
    // eslint-disable-next-line no-console
    console.log('[SW] onBackgroundMessage payload:', payload);
  } catch (e) {}

  const notification = payload.notification || {};
  const title = notification.title || 'AI Dev Community';
  const options = {
    body: notification.body || '',
    icon: notification.icon || '/logo.png',
    data: payload.data || payload || {},
    // Use messageId (if present) as tag so duplicate messages replace previous
    tag: payload.messageId || (payload.data && payload.data.messageId) || undefined,
    renotify: false,
  };

  // Show notification and log result
  self.registration.showNotification(title, options).catch((err) => {
    try { console.error('[SW] showNotification error', err); } catch (e) {}
  });
});

// Log service worker lifecycle events for easier debugging
self.addEventListener('install', (event) => {
  try { console.log('[SW] install'); } catch (e) {}
});

self.addEventListener('activate', (event) => {
  try { console.log('[SW] activate'); } catch (e) {}
});

// Handle notification click to open the app (uses fcmOptions.link or data.url)
self.addEventListener('notificationclick', function(event) {
  try {
    // eslint-disable-next-line no-console
    console.log('[SW] notificationclick', event.notification && event.notification.data);
  } catch (e) {}
  event.notification.close();
  // Prefer data.url if provided; otherwise open root but include title/body in query params
  const data = (event.notification && event.notification.data) || {};
  const base = (data && data.url) || '/';
  try {
    const title = encodeURIComponent(event.notification.title || 'AI Dev Community');
    const body = encodeURIComponent(event.notification.body || (data && data.body) || '');
    // Optionally include fullText in base64 (UTF-8 safe) if available and not too long
    let fullParam = '';
    try {
      const full = data && (data.fullText || data.fulltext || data.full);
      if (full && typeof full === 'string' && full.length > 0) {
        // encode unicode to base64
        const utf8 = encodeURIComponent(full).replace(/%([0-9A-F]{2})/g, function(match, p1) {
          return String.fromCharCode('0x' + p1);
        });
        const b64 = btoa(utf8);
        // Limit length to avoid overly long URLs
        if (b64.length < 2000) {
          fullParam = `&full=${encodeURIComponent(b64)}`;
        }
      }
    } catch (e) {
      // ignore encoding errors
    }
    const url = `${base}${base.includes('?') ? '&' : '?'}notif=1&title=${title}&body=${body}${fullParam}`;

    const p = clients.matchAll({ type: 'window', includeUncontrolled: true }).then(async (clientList) => {
      for (const client of clientList) {
        // try to navigate the existing client to the notif URL (ensures modal reads URL params)
        try {
          if (client && 'navigate' in client && typeof client.navigate === 'function') {
            // navigate returns a promise resolving to a WindowClient
            await client.navigate(url);
            client.focus();
            return;
          }
        } catch (e) {
          // ignore and fallback to postMessage
        }

        // Fallback: focus and postMessage so the app can show modal
        try {
          if ('focus' in client) {
            client.focus();
          }
          client.postMessage({ type: 'fcm-notification', title: event.notification.title, body: event.notification.body, data });
          return;
        } catch (e) {
          // ignore and try next client
        }
      }

      // No client found; open a new window with the URL params (will show modal on load)
      if (clients.openWindow) return clients.openWindow(url);
      return;
    });

    event.waitUntil(p);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[SW] notificationclick error', err);
    event.waitUntil(clients.openWindow('/'));
  }
});
