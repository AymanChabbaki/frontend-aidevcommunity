import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { requestPermissionAndRegisterToken } from '@/requestNotificationPermission';

export default function FirstVisitDialog() {
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    try {
      const shown = localStorage.getItem('notif_prompt_shown');
      if (shown === 'true') return;
      // Only prompt if notifications are available and not already granted/denied
      if (!('Notification' in window)) return;
      if (Notification.permission === 'granted') {
        localStorage.setItem('notif_prompt_shown', 'true');
        return;
      }
      if (Notification.permission === 'denied') {
        localStorage.setItem('notif_prompt_shown', 'true');
        return;
      }
      setVisible(true);
    } catch (e) {
      // ignore storage errors
    }
  }, []);

  async function handleYes() {
    setLoading(true);
    try {
      await requestPermissionAndRegisterToken();
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Permission request failed', e);
    } finally {
      localStorage.setItem('notif_prompt_shown', 'true');
      setLoading(false);
      setVisible(false);
    }
  }

  function handleNo() {
    localStorage.setItem('notif_prompt_shown', 'true');
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={handleNo} />
      <div className="relative bg-white dark:bg-slate-900 rounded-lg shadow-lg p-6 max-w-sm w-full mx-4">
        <h3 className="text-lg font-semibold">Enable Azkar & Salat reminders</h3>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Would you like to enable browser notifications for daily azkar and prayer time reminders?</p>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="ghost" onClick={handleNo} disabled={loading}>No</Button>
          <Button onClick={handleYes} disabled={loading}>{loading ? 'Enabling...' : 'Yes, enable'}</Button>
        </div>
      </div>
    </div>
  );
}
