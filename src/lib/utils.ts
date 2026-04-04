import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a Date object or ISO string into a local datetime string 
 * suitable for <input type="datetime-local"> (YYYY-MM-DDTHH:mm)
 */
export function formatDateForInput(dateInput: string | Date | null | undefined): string {
  if (!dateInput) return '';
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) return '';
  return format(date, "yyyy-MM-dd'T'HH:mm");
}
