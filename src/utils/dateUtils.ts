
/**
 * Format a UTC timestamp using the user's local time zone.
 */
export function formatLocalDateTime(utcDate: string): string {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(utcDate));
}

/**
 * Return the start of today in the user's local time zone.
 */
export function getStartOfToday(): Date {
  const now = new Date();

  return new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  );
}

/**
 * Group a scheduled timestamp into Today, Tomorrow, or a date.
 */
export function getDateGroup(utcDate: string): string {
  const scheduledDate = new Date(utcDate);

  if (Number.isNaN(scheduledDate.getTime())) {
    return 'Invalid date';
  }

  const today = getStartOfToday();

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const scheduledDay = new Date(
    scheduledDate.getFullYear(),
    scheduledDate.getMonth(),
    scheduledDate.getDate(),
  );

  if (scheduledDay.getTime() === today.getTime()) {
    return 'Today';
  }

  if (scheduledDay.getTime() === tomorrow.getTime()) {
    return 'Tomorrow';
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'full',
  }).format(scheduledDate);
}

/**
 * Convert a local date-time input value into a UTC ISO timestamp.
 */
export function localDateTimeToUTC(localDateTime: string): string {
  const date = new Date(localDateTime);

  if (Number.isNaN(date.getTime())) {
    throw new Error('Please enter a valid date and time.');
  }

  return date.toISOString();
}

/**
 * Check whether a scheduled timestamp is in the future.
 */
export function isFutureDate(utcDate: string): boolean {
  const scheduledDate = new Date(utcDate);

  return (
    !Number.isNaN(scheduledDate.getTime()) &&
    scheduledDate.getTime() > Date.now()
  );
}

const DAY_MS = 24 * 60 * 60 * 1000;

function formatTime(date: Date): string {
  return new Intl.DateTimeFormat(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}

/**
 * Format a timestamp like "Sun, Oct 11, 2026 at 7:00 PM".
 */
export function formatPostDateTime(utcDate: string): string {
  const date = new Date(utcDate);

  if (Number.isNaN(date.getTime())) return 'Invalid date';

  const day = new Intl.DateTimeFormat(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);

  return `${day} at ${formatTime(date)}`;
}

/**
 * Format a timestamp relative to today, e.g. "Today 11:00 AM".
 */
export function formatRelativeDateTime(utcDate: string): string {
  const date = new Date(utcDate);

  if (Number.isNaN(date.getTime())) return 'Invalid date';

  const day = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const dayDiff = Math.round(
    (day.getTime() - getStartOfToday().getTime()) / DAY_MS,
  );

  const labels: Record<number, string> = {
    [-1]: 'Yesterday',
    0: 'Today',
    1: 'Tomorrow',
  };

  const dayLabel =
    labels[dayDiff] ??
    new Intl.DateTimeFormat(undefined, {
      month: 'short',
      day: 'numeric',
    }).format(date) + ',';

  return `${dayLabel} ${formatTime(date)}`;
}

/**
 * Format just the time portion of a timestamp in local time.
 */
export function formatLocalTime(utcDate: string): string {
  const date = new Date(utcDate);

  return Number.isNaN(date.getTime()) ? '' : formatTime(date);
}

/**
 * Today's date like "Thu, Oct 15".
 */
export function formatToday(): string {
  return new Intl.DateTimeFormat(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(new Date());
}

/**
 * The user's IANA time zone, e.g. "Asia/Calcutta".
 */
export function getTimeZone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

/**
 * Convert a Date or timestamp into a local "YYYY-MM-DD" key.
 */
export function getLocalDateKey(value: string | Date): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return '';

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}
