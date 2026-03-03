import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import api from '@/lib/api';

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
        // If a messageId is present, fetch the full text from the backend
        const messageId = params.get('messageId');
        let b = '';
        if (messageId) {
          try {
            api.get(`/fcm/message/${encodeURIComponent(messageId)}`).then((res) => {
              const ft = res.data?.data?.fullText;
              setTitle(t);
              setBody(ft || '');
              setOpen(true);
            }).catch(() => {
              // fallback to snippet or body param
              const snippet = params.get('body') ? decodeURIComponent(params.get('body') as string) : '';
              setTitle(t);
              setBody(snippet);
              setOpen(true);
            });
            // cleanup url params below
          } catch (e) {
            // fallback below
          }
        } else {
          // Prefer full base64 param if provided
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
        }
        // remove params from URL
        const url = new URL(window.location.href);
        url.searchParams.delete('notif');
        url.searchParams.delete('title');
        url.searchParams.delete('body');
        url.searchParams.delete('full');
        url.searchParams.delete('messageId');
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
          // If messageId provided in postMessage, fetch fullText, otherwise prefer provided snippet/body
          const mid = data.data?.messageId;
          if (mid) {
            try {
              api.get(`/fcm/message/${encodeURIComponent(mid)}`).then((res) => {
                setBody(res.data?.data?.fullText || data.body || data.data?.snippet || '');
                setOpen(true);
              }).catch(() => {
                setBody(data.data?.snippet || data.body || '');
                setOpen(true);
              });
            } catch (e) {
              setBody(data.data?.snippet || data.body || '');
              setOpen(true);
            }
          } else {
            setBody(data.data?.fullText || data.body || data.data?.body || data.data?.snippet || '');
            setOpen(true);
          }
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
        const mid = detail.data?.messageId;
        if (mid) {
          api.get(`/fcm/message/${encodeURIComponent(mid)}`).then((res) => {
            setBody(res.data?.data?.fullText || detail.body || detail.data?.snippet || '');
            setOpen(true);
          }).catch(() => {
            setBody(detail.data?.snippet || detail.body || '');
            setOpen(true);
          });
        } else {
          setBody(detail.data?.fullText || detail.body || detail.data?.body || detail.data?.snippet || '');
          setOpen(true);
        }
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
