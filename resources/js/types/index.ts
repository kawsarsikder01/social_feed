export type * from './auth';
export type * from './navigation';
export type * from './ui';

export interface Author {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  name: string;
}

/** A person that can be rendered by the Avatar component. Both the
 *  authenticated `User` (id/name/email) and post `Author` (first_name/last_name)
 *  shapes satisfy this interface. */
export interface AvatarPerson {
  id: string | number;
  name?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
}

/** Converts a date string to a human-readable "time ago" format */
export function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);
  const diffWeek = Math.floor(diffDay / 7);
  const diffMonth = Math.floor(diffDay / 30);

  if (diffSec < 60) {
    return 'just now';
  }

  if (diffMin < 60) {
    return `${diffMin}m`;
  }

  if (diffHr < 24) {
    return `${diffHr}h`;
  }

  if (diffDay < 7) {
    return `${diffDay}d`;
  }

  if (diffWeek < 5) {
    return `${diffWeek}w`;
  }

  return `${diffMonth}mo`;
}

/** Gets the avatar initial from a person */
export function getInitial(person: AvatarPerson | null): string {
  if (!person) {
    return '?';
  }

  const name = person.name ?? `${person.first_name ?? ''} ${person.last_name ?? ''}`.trim();
  const source = name || person.email || '';

  return (source[0] ?? '?').toUpperCase();
}

/** Deterministic color palette for avatar backgrounds */
const AVATAR_COLORS = [
  '#1890FF', '#13C2C2', '#52C41A', '#FA8C16',
  '#F5222D', '#722ED1', '#EB2F96', '#2F54EB',
  '#FAAD14', '#A0D911',
];

export function getAvatarColor(person: AvatarPerson | null): string {
  if (!person) {
    return AVATAR_COLORS[0];
  }

  const code = String(person.id).split('').reduce((sum, ch) => sum + ch.charCodeAt(0), 0);

  return AVATAR_COLORS[code % AVATAR_COLORS.length];
}
