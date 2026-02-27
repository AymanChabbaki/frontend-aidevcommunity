import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Bell } from 'lucide-react';
import { requestPermissionAndRegisterToken } from '@/requestNotificationPermission';
import { enableInAppReminders, disableInAppReminders } from '@/lib/inAppReminders';
import { useToast } from '@/hooks/use-toast';

const BACKEND_API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function NotificationToggle() {
  const [granted, setGranted] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);
  const [inApp, setInApp] = useState<boolean>(() => localStorage.getItem('inapp_reminders') === 'true');
  const toast = useToast();

  useEffect(() => {
    setGranted(Notification.permission === 'granted');
  }, []);

  async function enable() {
    setLoading(true);
    try {
      const token = await requestPermissionAndRegisterToken();
      if (token) {
        localStorage.setItem('fcm_token', token);
        setGranted(true);
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Enable notifications failed', e);
    } finally {
      setLoading(false);
    }
  }

  async function enableInApp() {
    setLoading(true);
    try {
      const ok = await enableInAppReminders();
      if (ok) {
        localStorage.setItem('inapp_reminders', 'true');
        setInApp(true);
        toast.toast({ title: 'In-app reminders enabled', description: 'You will receive reminders while the site is open.' });
      } else {
        toast.toast({ title: 'Failed', description: 'Could not enable in-app reminders.' });
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  function disableInApp() {
    disableInAppReminders();
    localStorage.removeItem('inapp_reminders');
    setInApp(false);
    toast.toast({ title: 'In-app reminders disabled' });
  }

  async function disable() {
    setLoading(true);
    try {
      const token = localStorage.getItem('fcm_token');
      if (token) {
        await fetch(`${BACKEND_API}/fcm/delete`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });
        localStorage.removeItem('fcm_token');
      }
      setGranted(false);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Disable notifications failed', e);
    } finally {
      setLoading(false);
    }
  }

  // Detect push support; if missing (e.g., Safari iOS), offer in-app reminders instead
  const pushSupported = typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window;

  return (
    <div>
      {pushSupported ? (
        granted ? (
          <Button variant="ghost" size="icon" onClick={disable} disabled={loading} title="Disable notifications">
            <Bell className="h-5 w-5 text-primary" />
          </Button>
        ) : (
          <Button variant="ghost" size="icon" onClick={enable} disabled={loading} title="Enable notifications">
            <Bell className="h-5 w-5" />
          </Button>
        )
      ) : (
        // In-app reminders toggle for platforms without push
        inApp ? (
          <Button variant="ghost" size="icon" onClick={disableInApp} disabled={loading} title="Disable in-app reminders">
            <Bell className="h-5 w-5 text-primary" />
          </Button>
        ) : (
          <Button variant="ghost" size="icon" onClick={enableInApp} disabled={loading} title="Enable in-app reminders">
            <Bell className="h-5 w-5" />
          </Button>
        )
      )}
    </div>
  );
}
