
import { useEffect, useState } from 'react';
import type { SocialPlatform, SocialPost } from '../types/post';
import { isFutureDate, localDateTimeToUTC } from '../utils/dateUtils';
import { PLATFORMS, platformMeta } from '../constants/platforms';
import PlatformBadge from './PlatformBadge';
import { CloseIcon } from './Icons';

interface PostComposerProps {
  onCreatePost: (post: SocialPost) => void;
  onClose: () => void;
}

const platformLimits: Record<SocialPlatform, number> = {
  x: 280,
  instagram: 2200,
  tiktok: 2200,
  facebook: 5000,
};

const graphemeSegmenter =
  typeof Intl.Segmenter === 'function'
    ? new Intl.Segmenter(undefined, { granularity: 'grapheme' })
    : null;

/**
 * Count characters as people see them, so an emoji counts as one.
 */
function countCharacters(text: string): number {
  return graphemeSegmenter
    ? Array.from(graphemeSegmenter.segment(text)).length
    : Array.from(text).length;
}

const inputClass =
  'w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100';

export default function PostComposer({ onCreatePost, onClose }: PostComposerProps) {
  const [content, setContent] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<SocialPlatform[]>([]);
  const [mediaUrl, setMediaUrl] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [error, setError] = useState('');

  // Close on Escape and stop the page behind the dialog from scrolling.
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  const togglePlatform = (platform: SocialPlatform) => {
    setSelectedPlatforms((current) =>
      current.includes(platform)
        ? current.filter((item) => item !== platform)
        : [...current, platform],
    );
  };

  // Count the trimmed text, since that is what gets saved.
  const characterCount = countCharacters(content.trim());

  const characterErrors = selectedPlatforms.filter(
    (platform) => characterCount > platformLimits[platform],
  );

  const canSchedule =
    content.trim().length > 0 &&
    selectedPlatforms.length > 0 &&
    scheduledAt !== '' &&
    characterErrors.length === 0 &&
    isFutureDate(safeUTC(scheduledAt));

  function safeUTC(value: string): string {
    try {
      return localDateTimeToUTC(value);
    } catch {
      return '';
    }
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    if (!content.trim()) {
      setError('Please enter your post content.');
      return;
    }

    if (selectedPlatforms.length === 0) {
      setError('Please select at least one platform.');
      return;
    }

    if (!scheduledAt || !isFutureDate(safeUTC(scheduledAt))) {
      setError('Please select a date and time in the future.');
      return;
    }

    if (characterErrors.length > 0) {
      setError(
        `Your post exceeds the character limit for: ${characterErrors.join(', ')}.`,
      );
      return;
    }

    if (mediaUrl.trim()) {
      try {
        const parsedUrl = new URL(mediaUrl.trim());

        if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
          throw new Error('Invalid protocol');
        }
      } catch {
        setError('Please enter a valid image URL beginning with http:// or https://.');
        return;
      }
    }

    const newPost: SocialPost = {
      id: crypto.randomUUID(),
      content: content.trim(),
      platforms: selectedPlatforms,
      ...(mediaUrl.trim() ? { mediaUrl: mediaUrl.trim() } : {}),
      scheduledAt: safeUTC(scheduledAt),
      status: 'scheduled',
    };

    onCreatePost(newPost);

    setContent('');
    setSelectedPlatforms([]);
    setMediaUrl('');
    setScheduledAt('');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-gray-900/40 motion-safe:animate-fade-in"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="composer-title"
        className="flex h-full w-full max-w-xl flex-col bg-white shadow-2xl motion-safe:animate-slide-in-right"
      >
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-gray-200 px-5 py-4 sm:px-6">
          <div>
            <h2 id="composer-title" className="text-lg font-semibold text-gray-900">
              Create post
            </h2>
            <p className="mt-0.5 text-sm text-gray-500">
              Compose and schedule content across your platforms.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close composer"
            className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-900"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="flex-1 space-y-5 overflow-y-auto overscroll-contain px-5 py-5 sm:px-6">
            <div>
              <label htmlFor="post-content" className="mb-2 block text-sm font-medium text-gray-700">
                Post content
              </label>

              <textarea
                id="post-content"
                value={content}
                onChange={(event) => setContent(event.target.value)}
                placeholder="What would you like to share?"
                rows={5}
                autoFocus
                className={`${inputClass} p-3`}
              />

              {selectedPlatforms.length > 0 && (
                <div className="mt-3 space-y-2">
                  {selectedPlatforms.map((platform) => {
                    const count = characterCount;
                    const limit = platformLimits[platform];
                    const overLimit = count > limit;

                    return (
                      <div key={platform} className="flex justify-between text-xs">
                        <span className="text-gray-600">{platformMeta[platform].label}</span>
                        <span className={overLimit ? 'font-semibold text-red-600' : 'text-gray-500'}>
                          {count} / {limit}
                          {overLimit ? ' - Limit exceeded' : ''}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <fieldset>
              <legend className="mb-2 text-sm font-medium text-gray-700">
                Select platforms
              </legend>

              <div className="flex flex-wrap gap-2">
                {PLATFORMS.map((platform) => {
                  const isSelected = selectedPlatforms.includes(platform);

                  return (
                    <label
                      key={platform}
                      className={`flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 text-sm transition ${
                        isSelected
                          ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                          : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => togglePlatform(platform)}
                        className="accent-indigo-600"
                      />
                      <PlatformBadge platform={platform} labelled={false} />
                      {platformMeta[platform].label}
                    </label>
                  );
                })}
              </div>
            </fieldset>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="media-url" className="mb-2 block text-sm font-medium text-gray-700">
                  Image URL <span className="font-normal text-gray-400">(optional)</span>
                </label>

                <input
                  id="media-url"
                  type="url"
                  value={mediaUrl}
                  onChange={(event) => setMediaUrl(event.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="scheduled-at" className="mb-2 block text-sm font-medium text-gray-700">
                  Schedule date and time
                </label>

                <input
                  id="scheduled-at"
                  type="datetime-local"
                  value={scheduledAt}
                  min={new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
                    .toISOString()
                    .slice(0, 16)}
                  onChange={(event) => setScheduledAt(event.target.value)}
                  className={inputClass}
                />
              </div>
            </div>

            {error && (
              <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">
                {error}
              </p>
            )}
          </div>

          <div className="flex shrink-0 flex-col-reverse gap-3 border-t border-gray-200 bg-white px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={!canSchedule}
              className="rounded-xl bg-indigo-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Schedule post
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
