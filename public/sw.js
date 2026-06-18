// Flip Property Coach - Service Worker
// Provides foundation for future Web Push Notifications + PWA capabilities

const CACHE_NAME = 'flip-property-coach-v1.2.0';

self.addEventListener('install', (event) => {
  console.log('[SW] Service Worker installed');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('[SW] Service Worker activated');
  event.waitUntil(self.clients.claim());
});

// Placeholder for future push event handling
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    const title = data.title || 'Flip Property Coach';
    const options = {
      body: data.body || 'You have a new update',
      icon: '/logo.png',
      badge: '/logo.png',
      data: data.data || {},
    };
    event.waitUntil(self.registration.showNotification(title, options));
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  if (event.notification.data && event.notification.data.url) {
    event.waitUntil(clients.openWindow(event.notification.data.url));
  } else {
    event.waitUntil(clients.openWindow('/dashboard'));
  }
});