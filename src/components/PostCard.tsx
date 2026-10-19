
import { useState } from 'react';
import type { SocialPost } from '../types/post';
import { formatPostDateTime } from '../utils/dateUtils';
import PlatformBadge from './PlatformBadge';
import StatusPill from './StatusPill';
import { AlertCircleIcon, ImageIcon, RetryIcon } from './Icons';

interface PostCardProps {
  post: SocialPost;
  onRetry?: (postId: string) => void;
  isRetrying?: boolean;
  variant?: 'card' | 'row';
}

export default function PostCard({
  post,
  onRetry,
  isRetrying = false,
  variant = 'card',
}: PostCardProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const showFailure = post.status === 'failed' || isRetrying;

  const containerClass =
    variant === 'card'
      ? 'rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow-md sm:p-5'
      : 'px-4 py-5 sm:px-6';

  return (
    <article className={containerClass}>
      <div className="flex gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <div className="flex gap-1.5">
              {post.platforms.map((platform) => (
                <PlatformBadge key={platform} platform={platform} />
              ))}
            </div>

            <StatusPill status={post.status} isRetrying={isRetrying} />

            <time dateTime={post.scheduledAt} className="text-sm text-gray-500">
              {formatPostDateTime(post.scheduledAt)}
            </time>
          </div>

          <p className="mt-3 whitespace-pre-wrap break-words text-[15px] leading-7 text-gray-900">
            {post.content}
          </p>

          {showFailure && (
            <div className="mt-4 flex flex-col gap-3 rounded-lg border border-red-200 bg-red-50 p-3 sm:flex-row sm:items-center sm:justify-between sm:pl-4">
              <p className="flex items-start gap-2 text-sm text-red-600">
                <AlertCircleIcon className="mt-0.5 h-4 w-4 shrink-0" />
                <span>
                  {isRetrying
                    ? 'Retrying this post...'
                    : post.errorMessage ?? 'This post failed to publish.'}
                </span>
              </p>

              {onRetry && (
                <button
                  type="button"
                  onClick={() => onRetry(post.id)}
                  disabled={isRetrying}
                  className="inline-flex w-fit shrink-0 items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-900 shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <RetryIcon className={`h-4 w-4 ${isRetrying ? 'animate-spin' : ''}`} />
                  {isRetrying ? 'Retrying...' : 'Retry'}
                </button>
              )}
            </div>
          )}
        </div>

        {post.mediaUrl && (
          <a
            href={post.mediaUrl}
            target="_blank"
            rel="noreferrer"
            className="shrink-0 self-start"
            aria-label="View attached image"
            title="View attached image"
          >
            {imageFailed ? (
              <span className="flex h-16 w-16 items-center justify-center rounded-lg bg-gray-100 text-gray-400 sm:h-[68px] sm:w-[68px]">
                <ImageIcon className="h-6 w-6" />
              </span>
            ) : (
              <img
                src={post.mediaUrl}
                alt=""
                loading="lazy"
                onError={() => setImageFailed(true)}
                className="h-16 w-16 rounded-lg object-cover sm:h-[68px] sm:w-[68px]"
              />
            )}
          </a>
        )}
      </div>
    </article>
  );
}
