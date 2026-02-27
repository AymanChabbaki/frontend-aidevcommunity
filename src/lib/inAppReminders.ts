import { toast } from '@/hooks/use-toast';

type Timer = ReturnType<typeof setTimeout>;

const CITY = 'Casablanca';
const COUNTRY = 'Morocco';

let timers: Timer[] = [];

function clearTimers() {
  timers.forEach((t) => clearTimeout(t));
  timers = [];
}

function showReminder(title: string, body?: string) {
  toast({
    title,
    description: body,
  });
}

export async function enableInAppReminders() {
  try {
    const nowDate = new Date();
    const dd = String(nowDate.getDate()).padStart(2, '0');
    const mm = String(nowDate.getMonth() + 1).padStart(2, '0');
    const yyyy = String(nowDate.getFullYear());
    const datePath = `${dd}-${mm}-${yyyy}`; // e.g. 27-02-2026
    const res = await fetch(
      `https://api.aladhan.com/v1/timingsByCity/${datePath}?city=${encodeURIComponent(CITY)}&country=${encodeURIComponent(
        COUNTRY,
      )}&method=2`,
    );
    const data = await res.json();
    if (!data || data.code !== 200) return false;

    const timings = data.data.timings as Record<string, string>;
    const dateStr = data.data.date.readable; // e.g., '27 Feb 2026'

    const prayerNames = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

    prayerNames.forEach((name) => {
      const time = timings[name];
      if (!time) return;
      // Parse time like '18:34' possibly with (DST)
      const hhmm = time.split(' ')[0];
      const [hh, mm] = hhmm.split(':').map(Number);
      const date = new Date();
      const parts = dateStr.split(' ');
      // Set to today keeping local timezone
      const target = new Date(date.getFullYear(), date.getMonth(), date.getDate(), hh, mm, 0, 0);
      const delay = target.getTime() - Date.now();
      if (delay > 0) {
        const t = setTimeout(() => showReminder(`${name} reminder`, `It's time for ${name}.`), delay);
        timers.push(t);
      }
    });

    // Schedule a refresh at midnight to reschedule next day
    const midnightBase = new Date();
    const msToMidnight = new Date(midnightBase.getFullYear(), midnightBase.getMonth(), midnightBase.getDate() + 1, 0, 1, 0).getTime() - Date.now();
    const refreshTimer = setTimeout(() => {
      clearTimers();
      enableInAppReminders();
    }, msToMidnight);
    timers.push(refreshTimer);

    return true;
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('Failed to enable in-app reminders', e);
    return false;
  }
}

export function disableInAppReminders() {
  clearTimers();
}
