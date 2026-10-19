
import { useEffect, useMemo, useRef, useState } from 'react';
import type { PostStatus, SocialPost } from '../types/post';
import { formatLocalTime, getLocalDateKey } from '../utils/dateUtils';
import { ChevronLeftIcon, ChevronRightIcon, CloseIcon } from './Icons';

interface CalendarViewProps {
  posts: SocialPost[];
  onSelectDate: (dateKey: string) => void;
}

const statusDot: Record<PostStatus, string> = {
  scheduled: 'bg-indigo-500',
  published: 'bg-green-500',
  failed: 'bg-red-500',
};

const MAX_VISIBLE = 3;
const POPOVER_MAX_ROWS = 7;

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function PostChip({ post }: { post: SocialPost }) {
  return (
    <span
      className="flex items-center gap-1.5 truncate rounded-md bg-gray-50 px-1.5 py-0.5 text-xs leading-4 text-gray-700"
      title={post.content}
    >
      <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${statusDot[post.status]}`} />
      <span className="shrink-0 font-medium">{formatLocalTime(post.scheduledAt)}</span>
      <span className="truncate text-gray-500">{post.content}</span>
    </span>
  );
}

export default function CalendarView({ posts, onSelectDate }: CalendarViewProps) {
  const [month, setMonth] = useState(() => startOfMonth(new Date()));
  const [expandedKey, setExpandedKey] = useState<string | null>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const todayKey = getLocalDateKey(new Date());

  // Close the "+N more" popover on Escape or a click outside it.
  useEffect(() => {
    if (!expandedKey) return;

    const handleMouseDown = (event: MouseEvent) => {
      const target = event.target as HTMLElement;

      if (
        !popoverRef.current?.contains(target) &&
        !target.closest('[aria-haspopup="dialog"]')
      ) {
        setExpandedKey(null);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setExpandedKey(null);
    };

    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [expandedKey]);

  const postsByDay = useMemo(() => {
    const map = new Map<string, SocialPost[]>();

    [...posts]
      .sort(
        (a, b) =>
          new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime(),
      )
      .forEach((post) => {
        const key = getLocalDateKey(post.scheduledAt);
        if (!key) return;
        map.set(key, [...(map.get(key) ?? []), post]);
      });

    return map;
  }, [posts]);

  const days = useMemo(() => {
    const first = new Date(month);
    first.setDate(first.getDate() - first.getDay());

    return Array.from({ length: 42 }, (_, index) => {
      const date = new Date(first);
      date.setDate(first.getDate() + index);
      return date;
    });
  }, [month]);

  const weekdays = useMemo(
    () =>
      days.slice(0, 7).map((date) =>
        new Intl.DateTimeFormat(undefined, { weekday: 'short' }).format(date),
      ),
    [days],
  );

  const monthLabel = new Intl.DateTimeFormat(undefined, {
    month: 'long',
    year: 'numeric',
  }).format(month);

  const changeMonth = (offset: number) => {
    setExpandedKey(null);
    setMonth((current) => new Date(current.getFullYear(), current.getMonth() + offset, 1));
  };

  return (
    <section className="rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 px-4 py-4 sm:px-6">
        <h2 className="text-[17px] font-semibold text-gray-900">{monthLabel}</h2>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setExpandedKey(null);
              setMonth(startOfMonth(new Date()));
            }}
            className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Today
          </button>
          <button
            type="button"
            onClick={() => changeMonth(-1)}
            aria-label="Previous month"
            className="rounded-lg border border-gray-200 p-1.5 text-gray-600 hover:bg-gray-50"
          >
            <ChevronLeftIcon className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => changeMonth(1)}
            aria-label="Next month"
            className="rounded-lg border border-gray-200 p-1.5 text-gray-600 hover:bg-gray-50"
          >
            <ChevronRightIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50 text-center text-xs font-medium uppercase tracking-wide text-gray-500">
        {weekdays.map((weekday) => (
          <div key={weekday} className="py-2">
            {weekday}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {days.map((date, index) => {
          const key = getLocalDateKey(date);
          const dayPosts = postsByDay.get(key) ?? [];
          const inMonth = date.getMonth() === month.getMonth();
          const isToday = key === todayKey;
          const hasPosts = dayPosts.length > 0;
          const hiddenCount = dayPosts.length - MAX_VISIBLE;
          const isExpanded = expandedKey === key;
          const fullDate = new Intl.DateTimeFormat(undefined, { dateStyle: 'full' }).format(date);

          // Keep the popover inside the grid for the first and last columns.
          const column = index % 7;
          const popoverPosition =
            column === 0
              ? 'left-0'
              : column === 6
                ? 'right-0'
                : 'left-1/2 -translate-x-1/2';

          return (
            <div
              key={key}
              className={`relative flex min-h-16 flex-col border-b border-r border-gray-100 transition sm:min-h-28 ${
                inMonth ? 'bg-white' : 'bg-gray-50/60'
              } ${hasPosts ? 'hover:bg-indigo-50/50' : ''}`}
            >
              <button
                type="button"
                disabled={!hasPosts}
                onClick={() => onSelectDate(key)}
                aria-label={`${fullDate}, ${dayPosts.length} ${dayPosts.length === 1 ? 'post' : 'posts'}`}
                className={`flex flex-1 flex-col items-stretch gap-1 p-1.5 text-left sm:p-2 ${
                  hasPosts ? 'cursor-pointer' : 'cursor-default'
                } ${hiddenCount > 0 ? 'sm:pb-1' : ''}`}
              >
                <span
                  className={`flex h-7 w-7 items-center justify-center rounded-full text-sm ${
                    isToday
                      ? 'bg-indigo-500 font-semibold text-white'
                      : inMonth
                        ? 'text-gray-900'
                        : 'text-gray-400'
                  }`}
                >
                  {date.getDate()}
                </span>

                {hasPosts && (
                  <span className="rounded-md bg-indigo-50 px-1.5 py-0.5 text-center text-[11px] font-semibold text-indigo-600 sm:hidden">
                    {dayPosts.length}
                  </span>
                )}

                <span className="hidden space-y-1 sm:block">
                  {dayPosts.slice(0, MAX_VISIBLE).map((post) => (
                    <PostChip key={post.id} post={post} />
                  ))}
                </span>
              </button>

              {hiddenCount > 0 && (
                <button
                  type="button"
                  onClick={() => setExpandedKey(isExpanded ? null : key)}
                  aria-haspopup="dialog"
                  aria-expanded={isExpanded}
                  className="mx-2 mb-2 hidden w-fit rounded px-1.5 text-left text-xs font-medium text-indigo-600 hover:bg-indigo-100 hover:text-indigo-700 sm:block"
                >
                  +{hiddenCount} more
                </button>
              )}

              {isExpanded && (
                <div
                  ref={popoverRef}
                  role="dialog"
                  aria-label={`Posts on ${fullDate}`}
                  className={`absolute top-0 z-20 w-72 rounded-xl border border-gray-200 bg-white shadow-lg ${popoverPosition}`}
                >
                  <div className="flex items-center justify-between gap-2 border-b border-gray-200 px-3 py-2">
                    <p className="text-sm font-semibold text-gray-900">
                      {new Intl.DateTimeFormat(undefined, {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric',
                      }).format(date)}
                    </p>
                    <button
                      type="button"
                      onClick={() => setExpandedKey(null)}
                      aria-label="Close"
                      className="rounded-md p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                    >
                      <CloseIcon className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Rows are 1.25rem with 0.25rem gaps, so 11.25rem fits exactly 7 plus padding. */}
                  <div
                    className={`space-y-1 p-2 ${
                      dayPosts.length > POPOVER_MAX_ROWS
                        ? 'max-h-[11.25rem] overflow-y-auto overscroll-contain'
                        : ''
                    }`}
                  >
                    {dayPosts.map((post) => (
                      <PostChip key={post.id} post={post} />
                    ))}
                  </div>

                  <div className="border-t border-gray-200 px-3 py-2">
                    <button
                      type="button"
                      onClick={() => {
                        setExpandedKey(null);
                        onSelectDate(key);
                      }}
                      className="text-xs font-medium text-indigo-600 hover:text-indigo-700"
                    >
                      View in queue
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-4 px-4 py-4 text-xs text-gray-500 sm:px-6">
        {(Object.keys(statusDot) as PostStatus[]).map((status) => (
          <span key={status} className="flex items-center gap-1.5 capitalize">
            <span className={`h-2 w-2 rounded-full ${statusDot[status]}`} />
            {status}
          </span>
        ))}
        <span className="w-full sm:ml-auto sm:w-auto">
          Select a day to see its posts in the queue.
        </span>
      </div>
    </section>
  );
}
