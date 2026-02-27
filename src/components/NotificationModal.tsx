import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

export default function NotificationModal() {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');

  useEffect(() => {
    // Check URL params on mount
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get('notif')) {
        const t = params.get('title') ? decodeURIComponent(params.get('title') as string) : '';
        // Prefer full base64 param if provided
        let b = '';
        const fullB64 = params.get('full');
        if (fullB64) {
          try {
            const decoded = decodeURIComponent(Array.prototype.map.call(atob(decodeURIComponent(fullB64)), function(c: string) {
              return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            b = decoded;
          } catch (e) {
            // fallback to body param
            b = params.get('body') ? decodeURIComponent(params.get('body') as string) : '';
          }
        } else {
          b = params.get('body') ? decodeURIComponent(params.get('body') as string) : '';
        }
        setTitle(t);
        setBody(b);
        setOpen(true);
        // remove params from URL
        const url = new URL(window.location.href);
        url.searchParams.delete('notif');
        url.searchParams.delete('title');
        url.searchParams.delete('body');
        url.searchParams.delete('full');
        window.history.replaceState({}, document.title, url.toString());
      }
    } catch (e) {
      // ignore
    }

    // Listen for messages from SW (notification click) or foreground messages
    const handler = (e: MessageEvent) => {
      try {
        const data = e.data;
        if (!data) return;
        if (data.type === 'fcm-notification') {
          setTitle(data.title || 'AI Dev Community');
          // Prefer fullText if provided in data
          setBody(data.data?.fullText || data.body || data.data?.body || '');
          setOpen(true);
        }
      } catch (err) {
        // ignore
      }
    };
    window.addEventListener('message', handler);
    // Also listen to a custom event triggered by firebase onMessage
    const customHandler = (ev: Event) => {
      // @ts-ignore
      const detail = (ev as CustomEvent).detail;
      if (detail && detail.type === 'fcm-notification') {
        setTitle(detail.title || 'AI Dev Community');
        setBody(detail.data?.fullText || detail.body || detail.data?.body || '');
        setOpen(true);
      }
    };
    window.addEventListener('fcm-notification', customHandler as EventListener);

    return () => {
      window.removeEventListener('message', handler);
      window.removeEventListener('fcm-notification', customHandler as EventListener);
    };
  }, []);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
      <div className="relative bg-white dark:bg-slate-900 rounded-lg shadow-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold">{title}</h3>
        <div className="mt-3 text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{body}</div>
        <div className="mt-4 flex justify-end">
          <Button variant="ghost" onClick={() => setOpen(false)}>Close</Button>
        </div>
      </div>
    </div>
  );
}
