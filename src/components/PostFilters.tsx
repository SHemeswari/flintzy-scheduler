
import type { PostStatus, SocialPlatform } from '../types/post';
import { PLATFORMS, platformMeta } from '../constants/platforms';
import PlatformBadge from './PlatformBadge';
import Select, { type SelectOption } from './Select';

const platformOptions: SelectOption<SocialPlatform | 'all'>[] = [
  { value: 'all', label: 'All platforms' },
  ...PLATFORMS.map((platform) => ({
    value: platform,
    label: platformMeta[platform].label,
    icon: <PlatformBadge platform={platform} size="sm" labelled={false} />,
  })),
];

const statusDot = (className: string) => (
  <span className={`h-2 w-2 shrink-0 rounded-full ${className}`} aria-hidden="true" />
);

const statusOptions: SelectOption<PostStatus | 'all'>[] = [
  { value: 'all', label: 'All statuses' },
  { value: 'scheduled', label: 'Scheduled', icon: statusDot('bg-indigo-500') },
  { value: 'published', label: 'Published', icon: statusDot('bg-green-500') },
  { value: 'failed', label: 'Failed', icon: statusDot('bg-red-500') },
];

interface PostFiltersProps {
  platform: SocialPlatform | 'all';
  status: PostStatus | 'all';
  scheduledDate: string;
  onPlatformChange: (platform: SocialPlatform | 'all') => void;
  onStatusChange: (status: PostStatus | 'all') => void;
  onScheduledDateChange: (date: string) => void;
}

const fieldClass =
  'w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100';

export default function PostFilters({
  platform,
  status,
  scheduledDate,
  onPlatformChange,
  onStatusChange,
  onScheduledDateChange,
}: PostFiltersProps) {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label
            htmlFor="filter-date"
            className="mb-1.5 block text-sm font-medium text-gray-700"
          >
            Scheduled date
          </label>
          <div className="flex gap-2">
            <input
              id="filter-date"
              type="date"
              value={scheduledDate}
              onChange={(event) => onScheduledDateChange(event.target.value)}
              className={`${fieldClass} min-w-0 flex-1`}
            />
            {scheduledDate && (
              <button
                type="button"
                onClick={() => onScheduledDateChange('')}
                className="rounded-xl border border-gray-200 px-3 text-sm text-gray-600 hover:bg-gray-50"
                aria-label="Clear scheduled date filter"
                title="Clear date filter"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        <Select
          id="filter-platform"
          label="Platform"
          value={platform}
          options={platformOptions}
          onChange={onPlatformChange}
        />

        <Select
          id="filter-status"
          label="Status"
          value={status}
          options={statusOptions}
          onChange={onStatusChange}
        />
      </div>
    </section>
  );
}
