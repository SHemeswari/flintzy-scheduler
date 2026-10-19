
import { useMemo } from 'react';
import type { SocialPost } from '../types/post';
import PostCard from './PostCard';
import { getDateGroup } from '../utils/dateUtils';

interface PostQueueProps {
  posts: SocialPost[];
  onRetry: (postId: string) => void;
  retryingPostIds: string[];
}

export default function PostQueue({
  posts,
  onRetry,
  retryingPostIds,
}: PostQueueProps) {
  const groupedPosts = useMemo(() => {
    const groups = new Map<string, SocialPost[]>();

    const sortedPosts = [...posts].sort(
      (a, b) =>
        new Date(a.scheduledAt).getTime() -
        new Date(b.scheduledAt).getTime(),
    );

    sortedPosts.forEach((post) => {
      const groupName = getDateGroup(post.scheduledAt);
      const existing = groups.get(groupName) ?? [];

      existing.push(post);
      groups.set(groupName, existing);
    });

    return Array.from(groups.entries());
  }, [posts]);

  if (posts.length === 0) {
    return (
      <section className="rounded-2xl border border-gray-200 bg-white px-5 py-12 text-center shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">
          No posts found
        </h2>
        <p className="mt-2 text-sm text-gray-500">
          Try changing your search or filters, or create a new post.
        </p>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Post queue</h2>
        <span className="text-sm text-gray-500">
          {posts.length} {posts.length === 1 ? 'post' : 'posts'}
        </span>
      </div>

      {groupedPosts.map(([groupName, groupPosts]) => (
        <div key={groupName} className="space-y-3">
          <div className="flex items-center gap-3">
            <h3 className="text-sm font-semibold text-gray-700">
              {groupName}
            </h3>
            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
              {groupPosts.length}
            </span>
          </div>

          <div className="space-y-3">
            {groupPosts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onRetry={onRetry}
                isRetrying={retryingPostIds.includes(post.id)}
              />
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}
