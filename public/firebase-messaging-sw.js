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
    icon: notification.icon || '/Podcast.png',
    data: payload.data || payload || {},
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
  const url = (event.notification && event.notification.data && event.notification.data.url) || '/';
  event.waitUntil(clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
    for (const client of clientList) {
      if (client.url === url && 'focus' in client) return client.focus();
    }
    if (clients.openWindow) return clients.openWindow(url);
  }));
});
