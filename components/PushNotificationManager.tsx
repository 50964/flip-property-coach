'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface PushNotificationManagerProps {
  userId: string | null;
}

export default function PushNotificationManager({ userId }: PushNotificationManagerProps) {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setIsSupported(true);
      setPermission(Notification.permission);
    }
  }, []);

  // Register Service Worker (foundation for future real push)
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('[Push] Service Worker registered:', registration.scope);
        })
        .catch((error) => {
          console.error('[Push] Service Worker registration failed:', error);
        });
    }
  }, []);

  const requestPermission = async () => {
    if (!isSupported) {
      toast.error('Browser notifications are not supported on this device.');
      return;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);

      if (result === 'granted') {
        toast.success('Browser notifications enabled!', {
          description: 'You will now receive native alerts for new leads and replies.',
        });
        // Show a test notification
        new Notification('Flip Property Coach', {
          body: 'Notifications are now active. You will be alerted in real time.',
          icon: '/logo.png',
        });
      } else if (result === 'denied') {
        toast.error('Notifications blocked', {
          description: 'You can enable them later in your browser settings.',
        });
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      toast.error('Could not enable notifications');
    }
  };

  // Expose a function to show native notification (used by parent components)
  const showNativeNotification = (title: string, body: string, url?: string) => {
    if (permission === 'granted' && isSupported) {
      const notification = new Notification(title, {
        body,
        icon: '/logo.png',
        badge: '/logo.png',
        tag: 'flip-alert', // prevents duplicate notifications
      });

      if (url) {
        notification.onclick = () => {
          window.focus();
          window.location.href = url;
          notification.close();
        };
      }
    }
  };

  // Make showNativeNotification available globally for realtime handlers
  useEffect(() => {
    if (userId && permission === 'granted') {
      (window as any).__flipShowNativeNotification = showNativeNotification;
    }
    return () => {
      delete (window as any).__flipShowNativeNotification;
    };
  }, [userId, permission]);

  if (!isSupported || permission === 'granted') {
    return null; // Don't show anything if not supported or already granted
  }

  return (
    <button
      onClick={requestPermission}
      className="flex items-center gap-2 px-3 py-1.5 text-xs rounded-lg bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors"
    >
      🔔 Enable browser alerts
    </button>
  );
}
