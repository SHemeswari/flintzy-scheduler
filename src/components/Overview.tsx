
import { useMemo, type ComponentType, type SVGProps } from 'react';
import type { SocialPost } from '../types/post';
import { PLATFORMS, platformMeta } from '../constants/platforms';
import { formatRelativeDateTime, isFutureDate } from '../utils/dateUtils';
import PlatformBadge from './PlatformBadge';
import PostCard from './PostCard';
import {
  AlertCircleIcon,
  CheckCircleIcon,
  ClockIcon,
  LayersIcon,
} from './Icons';

interface OverviewProps {
  posts: SocialPost[];
  retryingPostIds: string[];
  onRetry: (postId: string) => void;
  onViewFailed: () => void;
}

interface StatCardProps {
  label: string;
  value: number;
  detail: string;
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
  iconClass: string;
}

function StatCard({ label, value, detail, Icon, iconClass }: StatCardProps) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <p className="pt-1 text-[15px] font-medium text-gray-600">{label}</p>
        <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${iconClass}`}>
          <Icon className="h-5 w-5" />
        </span>
      </div>
      <p className="mt-2 text-3xl font-semibold tracking-tight text-gray-900">
        {value}
      </p>
      <p className="mt-1 text-sm text-gray-500">{detail}</p>
    </div>
  );
}

const byTime = (a: SocialPost, b: SocialPost) =>
  new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime();

export default function Overview({
  posts,
  retryingPostIds,
  onRetry,
  onViewFailed,
}: OverviewProps) {
  const stats = useMemo(() => {
    const scheduled = posts.filter((post) => post.status === 'scheduled');
    const published = posts.filter((post) => post.status === 'published');
    const failed = posts.filter((post) => post.status === 'failed');

    const nextScheduled = scheduled
      .filter((post) => isFutureDate(post.scheduledAt))
      .sort(byTime)[0];

    const latestPublished = [...published].sort(byTime).at(-1);

    const platformCount = new Set(posts.flatMap((post) => post.platforms)).size;

    const scheduledByPlatform = PLATFORMS.map((platform) => ({
      platform,
      count: scheduled.filter((post) => post.platforms.includes(platform)).length,
    }));

    return {
      scheduled,
      published,
      failed,
      nextScheduled,
      latestPublished,
      platformCount,
      scheduledByPlatform,
    };
  }, [posts]);

  // Keep posts that are mid-retry visible so their progress can be seen.
  const attentionPosts = useMemo(
    () =>
      posts
        .filter(
          (post) =>
            post.status === 'failed' || retryingPostIds.includes(post.id),
        )
        .sort(byTime),
    [posts, retryingPostIds],
  );

  const maxPlatformCount = Math.max(
    1,
    ...stats.scheduledByPlatform.map((item) => item.count),
  );

  return (
    <div className="space-y-8">
      <section
        aria-label="Post summary"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        <StatCard
          label="Total posts"
          value={posts.length}
          detail={`Across ${stats.platformCount} ${
            stats.platformCount === 1 ? 'platform' : 'platforms'
          }`}
          Icon={LayersIcon}
          iconClass="bg-gray-100 text-gray-600"
        />
        <StatCard
          label="Scheduled"
          value={stats.scheduled.length}
          detail={
            stats.nextScheduled
              ? `Next: ${formatRelativeDateTime(stats.nextScheduled.scheduledAt)}`
              : 'Nothing upcoming'
          }
          Icon={ClockIcon}
          iconClass="bg-indigo-50 text-indigo-500"
        />
        <StatCard
          label="Published"
          value={stats.published.length}
          detail={
            stats.latestPublished
              ? `Latest: ${formatRelativeDateTime(stats.latestPublished.scheduledAt)}`
              : 'Nothing published yet'
          }
          Icon={CheckCircleIcon}
          iconClass="bg-green-50 text-green-600"
        />
        <StatCard
          label="Failed"
          value={stats.failed.length}
          detail={
            stats.failed.length === 0
              ? 'All clear'
              : stats.failed.length === 1
                ? 'Needs a retry'
                : 'Need a retry'
          }
          Icon={AlertCircleIcon}
          iconClass="bg-red-50 text-red-600"
        />
      </section>

      <div className="grid grid-cols-1 items-start gap-8 xl:grid-cols-[minmax(0,1fr)_400px]">
        <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-200 px-4 py-4 sm:px-6">
            <h2 className="text-[17px] font-semibold text-gray-900">
              Needs attention
            </h2>
            <button
              type="button"
              onClick={onViewFailed}
              className="text-[15px] font-medium text-indigo-500 hover:text-indigo-700"
            >
              View in queue
            </button>
          </div>

          {attentionPosts.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <CheckCircleIcon className="mx-auto h-8 w-8 text-green-500" />
              <p className="mt-3 font-medium text-gray-900">All caught up</p>
              <p className="mt-1 text-sm text-gray-500">
                No posts need a retry right now.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {attentionPosts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  variant="row"
                  onRetry={onRetry}
                  isRetrying={retryingPostIds.includes(post.id)}
                />
              ))}
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white shadow-sm">
          <h2 className="border-b border-gray-200 px-6 py-4 text-[17px] font-semibold text-gray-900">
            Scheduled by platform
          </h2>

          <ul className="space-y-5 px-6 py-5">
            {stats.scheduledByPlatform.map(({ platform, count }) => (
              <li key={platform}>
                <div className="flex items-center justify-between gap-3">
                  <span className="flex items-center gap-2 text-[17px] text-gray-900">
                    <PlatformBadge platform={platform} labelled={false} />
                    {platformMeta[platform].label}
                  </span>
                  <span className="text-[17px] font-medium text-gray-900">
                    {count}
                  </span>
                </div>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-gray-100">
                  <div
                    className={`h-full rounded-full ${platformMeta[platform].barClass}`}
                    style={{ width: `${(count / maxPlatformCount) * 100}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>

          <p className="border-t border-gray-200 px-6 py-5 text-sm text-gray-500">
            A post sent to several platforms counts once for each.
          </p>
        </section>
      </div>
    </div>
  );
}
