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
  const notification = payload.notification || {};
  const title = notification.title || 'AI Dev Community';
  const options = {
    body: notification.body || '',
    icon: notification.icon || '/Podcast.png',
    data: payload.data || {}
  };
  self.registration.showNotification(title, options);
});
