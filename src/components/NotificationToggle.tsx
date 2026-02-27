import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Bell } from 'lucide-react';
import { requestPermissionAndRegisterToken } from '@/requestNotificationPermission';

const BACKEND_API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function NotificationToggle() {
  const [granted, setGranted] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);

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

  return (
    <div>
      {granted ? (
        <Button variant="ghost" size="icon" onClick={disable} disabled={loading} title="Disable notifications">
          <Bell className="h-5 w-5 text-primary" />
        </Button>
      ) : (
        <Button variant="ghost" size="icon" onClick={enable} disabled={loading} title="Enable notifications">
          <Bell className="h-5 w-5" />
        </Button>
      )}
    </div>
  );
}
