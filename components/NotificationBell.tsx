'use client';

import React, { useState, useEffect } from 'react';
import { Bell, X } from 'lucide-react';
import { createClient } from '@/lib/supabase';
import { toast } from 'sonner';
import type { Lead } from '@/types';

interface Notification {
  id: string;
  type: 'new_lead' | 'reply_received';
  title: string;
  message: string;
  time: string;
  read: boolean;
  leadId?: string;
}

interface NotificationBellProps {
  userId: string | null;
  role: 'flipper' | 'supplier';
  supplierId?: string | null; // for suppliers
}

export default function NotificationBell({ userId, role, supplierId }: NotificationBellProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const supabase = createClient();

  // Load persisted notifications from localStorage
  useEffect(() => {
    if (!userId) return;
    const key = `flip_notifications_${userId}`;
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setNotifications(parsed);
        setUnreadCount(parsed.filter((n: Notification) => !n.read).length);
      } catch (e) {
        console.error('Failed to parse notifications');
      }
    }
  }, [userId]);

  // Save notifications to localStorage
  const saveNotifications = (newNotifs: Notification[]) => {
    if (!userId) return;
    const key = `flip_notifications_${userId}`;
    localStorage.setItem(key, JSON.stringify(newNotifs));
  };

  // Add a new notification
  const addNotification = (notif: Omit<Notification, 'id' | 'time' | 'read'>) => {
    const newNotif: Notification = {
      ...notif,
      id: Date.now().toString(36) + Math.random().toString(36).substr(2),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: false,
    };

    setNotifications(prev => {
      const updated = [newNotif, ...prev].slice(0, 20); // keep last 20
      saveNotifications(updated);
      return updated;
    });

    setUnreadCount(prev => prev + 1);

    // Show toast
    if (notif.type === 'new_lead') {
      toast.success(notif.title, {
        description: notif.message,
        duration: 6000,
        action: {
          label: 'View',
          onClick: () => {
            window.location.href = '/supplier-dashboard';
          },
        },
      });
    } else {
      toast.info(notif.title, {
        description: notif.message,
        duration: 6000,
      });
    }

    // Trigger native browser push notification if permission is granted
    if (typeof window !== 'undefined') {
      if ((window as any).__flipShowNativeNotification) {
        (window as any).__flipShowNativeNotification(
          notif.title,
          notif.message,
          notif.type === 'new_lead' ? '/supplier-dashboard' : '/dashboard?tab=enquiries'
        );
      } else if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
        new Notification(notif.title, {
          body: notif.message,
          icon: '/icons/logos/logo-gold-512.jpg',
          tag: 'flip-alert',
        });
      }
    }
  };

  // Mark all as read
  const markAllRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updated);
    setUnreadCount(0);
    saveNotifications(updated);
  };

  // Clear all
  const clearAll = () => {
    setNotifications([]);
    setUnreadCount(0);
    if (userId) {
      localStorage.removeItem(`flip_notifications_${userId}`);
    }
  };

  // ============================================
  // REAL-TIME SUBSCRIPTIONS
  // ============================================
  useEffect(() => {
    if (!userId) return;

    let channel: any;

    if (role === 'supplier' && supplierId) {
      // Supplier: listen for NEW leads on their listing
      channel = supabase
        .channel(`supplier-leads-${supplierId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'leads',
            filter: `supplier_id=eq.${supplierId}`,
          },
          (payload) => {
            const newLead = payload.new as any;
            addNotification({
              type: 'new_lead',
              title: 'New Lead Received',
              message: `${newLead.flipper_name} • ${newLead.project || 'Property flip project'}`,
              leadId: newLead.id,
            });
          }
        )
        .subscribe();
    }

    if (role === 'flipper') {
      // Flipper: listen for REPLIES on leads they created
      channel = supabase
        .channel(`flipper-replies-${userId}`)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'leads',
            filter: `flipper_user_id=eq.${userId}`,
          },
          (payload) => {
            const updatedLead = payload.new as any;
            const oldLead = payload.old as any;

            // Only notify if a reply was just added
            if (updatedLead.reply_message && !oldLead?.reply_message) {
              addNotification({
                type: 'reply_received',
                title: 'Supplier Replied',
                message: `${updatedLead.project || 'Your enquiry'} — reply received`,
                leadId: updatedLead.id,
              });
            }
          }
        )
        .subscribe();
    }

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [userId, role, supplierId, supabase]);

  if (!userId) return null;

  return (
    <div className="relative">
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen && unreadCount > 0) {
            // Auto mark read when opening
            setTimeout(markAllRead, 300);
          }
        }}
        className="relative p-2 rounded-xl hover:bg-white/10 transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5 text-white" />
        {unreadCount > 0 && (
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
            <span className="text-[10px] font-bold text-white">{unreadCount > 9 ? '9+' : unreadCount}</span>
          </div>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-[#1a2332] border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
            <div className="font-semibold text-white">Notifications</div>
            <div className="flex items-center gap-2">
              {notifications.length > 0 && (
                <button
                  onClick={clearAll}
                  className="text-xs text-white/60 hover:text-white px-2 py-1 rounded hover:bg-white/10"
                >
                  Clear
                </button>
              )}
              <button onClick={() => setIsOpen(false)} className="text-white/60 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="max-h-[320px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-white/50 text-sm">
                No notifications yet.<br />New leads and replies will appear here in real time.
              </div>
            ) : (
              notifications.map((notif, index) => (
                <div
                  key={notif.id}
                  className={`px-4 py-3 border-b border-white/10 hover:bg-white/5 transition-colors ${!notif.read ? 'bg-white/5' : ''}`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${notif.type === 'new_lead' ? 'bg-emerald-400' : 'bg-blue-400'}`} />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-white text-sm">{notif.title}</div>
                      <div className="text-white/70 text-sm mt-0.5 line-clamp-2">{notif.message}</div>
                      <div className="text-white/40 text-xs mt-1">{notif.time}</div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {notifications.length > 0 && (
            <div className="px-4 py-2 bg-black/20 text-center">
              <div className="text-[10px] text-white/40">Real-time updates via Supabase</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
