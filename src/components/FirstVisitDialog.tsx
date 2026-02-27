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
      // Only prompt if notifications and push are available and not already granted/denied
      if (!('Notification' in window)) return;
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        // Not supported (e.g. some Safari versions). Do not repeatedly prompt.
        localStorage.setItem('notif_prompt_shown', 'true');
        return;
      }
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
      // Open a small popup that will call Notification.requestPermission()
      // and postMessage the result back. This sometimes avoids the browser
      // treating the prompt as indirect when the flow is complex.
      const popup = window.open('/enable-notifications.html', 'enable-notifs', 'width=480,height=360');

      let result: NotificationPermission | 'timeout' | 'unsupported' | 'error' = 'timeout';

      if (popup) {
        result = await new Promise((resolve) => {
          const onMessage = (e: MessageEvent) => {
            try {
              if (e.origin !== window.location.origin) return;
              if (e.data && 'permission' in e.data) {
                resolve(e.data.permission);
              }
            } catch (err) {
              // ignore
            }
          };
          window.addEventListener('message', onMessage);
          // safety timeout in case popup was blocked or user took too long
          const t = setTimeout(() => {
            window.removeEventListener('message', onMessage);
            resolve('timeout');
          }, 12000);
          // If popup is closed manually, treat as timeout
          const interval = setInterval(() => {
            if (popup.closed) {
              clearInterval(interval);
              clearTimeout(t);
              window.removeEventListener('message', onMessage);
              resolve('timeout');
            }
          }, 300);
        });
      } else {
        // popup blocked — fall back to direct permission request
        try {
          result = await Notification.requestPermission();
        } catch (e) {
          // eslint-disable-next-line no-console
          console.error('Direct permission request failed', e);
          result = 'error';
        }
      }

      if (result === 'granted') {
        await requestPermissionAndRegisterToken();
        localStorage.setItem('notif_prompt_shown', 'true');
        setVisible(false);
      } else if (result === 'denied') {
        setShowInstructions(true);
        localStorage.setItem('notif_prompt_shown', 'true');
      } else {
        // timeout, unsupported or dismissed — mark shown and close prompt
        localStorage.setItem('notif_prompt_shown', 'true');
        setVisible(false);
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Permission request failed', e);
    } finally {
      setLoading(false);
    }
  }

  function handleNo() {
    localStorage.setItem('notif_prompt_shown', 'true');
    setVisible(false);
  }

  const [showInstructions, setShowInstructions] = React.useState(false);

  function closeInstructions() {
    setShowInstructions(false);
    setVisible(false);
  }

  if (!visible && !showInstructions) return null;

  return (
    <>
      {visible && (
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
      )}

      {showInstructions && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={closeInstructions} />
          <div className="relative bg-white dark:bg-slate-900 rounded-lg shadow-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold">Allow notifications in Chrome</h3>
            <div className="mt-3 text-sm text-slate-600 dark:text-slate-300">
              <p>If you accidentally blocked notifications, follow these steps to re-enable them:</p>
              <ol className="list-decimal list-inside mt-2 space-y-1">
                <li>Click the lock icon next to the URL in your browser's address bar.</li>
                <li>Find "Notifications" and set it to "Allow".</li>
                <li>Refresh the page.</li>
              </ol>
              <p className="mt-2">After that, open the site and use the notification button in the top navbar to enable reminders.</p>
            </div>
            <div className="mt-4 flex justify-end">
              <Button variant="ghost" onClick={closeInstructions}>Close</Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
