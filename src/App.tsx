
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { PostStatus, SocialPlatform, SocialPost } from './types/post';
import { fetchPosts, retryPublish } from './api/posts';
import Header from './components/Header';
import { ErrorState, LoadingState } from './components/LoadStates';
import Sidebar, { MobileNav, type AppView } from './components/Sidebar';
import Overview from './components/Overview';
import CalendarView from './components/CalendarView';
import PostFilters from './components/PostFilters';
import PostComposer from './components/PostComposer';
import PostQueue from './components/PostQueue';
import Toast, { type ToastMessage } from './components/Toast';
import { formatToday, getLocalDateKey, getTimeZone } from './utils/dateUtils';

type PlatformFilter = SocialPlatform | 'all';
type StatusFilter = PostStatus | 'all';

interface FiltersState {
  platform: PlatformFilter;
  status: StatusFilter;
  search: string;
  scheduledDate: string;
}

const viewTitles: Record<AppView, string> = {
  overview: 'Overview',
  queue: 'Post Queue',
  calendar: 'Calendar',
};

function isValidDateFilter(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

  const date = new Date(`${value}T00:00:00.000Z`);

  return (
    !Number.isNaN(date.getTime()) &&
    date.toISOString().slice(0, 10) === value
  );
}

function readFiltersFromUrl(): FiltersState {
  const params = new URLSearchParams(window.location.search);

  const platform = params.get('platform');
  const status = params.get('status');
  const date = params.get('date') ?? '';

  const validPlatforms = ['facebook', 'instagram', 'x', 'tiktok'];
  const validStatuses = ['scheduled', 'published', 'failed'];

  return {
    platform: validPlatforms.includes(platform ?? '')
      ? (platform as SocialPlatform)
      : 'all',
    status: validStatuses.includes(status ?? '')
      ? (status as PostStatus)
      : 'all',
    search: params.get('search') ?? '',
    scheduledDate: isValidDateFilter(date) ? date : '',
  };
}

function readViewFromUrl(): AppView {
  const view = new URLSearchParams(window.location.search).get('view');

  return view === 'queue' || view === 'calendar' ? view : 'overview';
}

export default function App() {
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [filters, setFilters] = useState<FiltersState>(readFiltersFromUrl);
  const [view, setView] = useState<AppView>(readViewFromUrl);
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [retryingPostIds, setRetryingPostIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [loadAttempt, setLoadAttempt] = useState(0);

  useEffect(() => {
    let isCancelled = false;

    fetchPosts(loadAttempt)
      .then((loadedPosts) => {
        if (isCancelled) return;
        setPosts(loadedPosts);
        setLoadError('');
      })
      .catch((error: unknown) => {
        if (isCancelled) return;
        setLoadError(
          error instanceof Error ? error.message : 'Something went wrong.',
        );
      })
      .finally(() => {
        if (!isCancelled) setIsLoading(false);
      });

    return () => {
      isCancelled = true;
    };
  }, [loadAttempt]);

  const handleReload = () => {
    setIsLoading(true);
    setLoadError('');
    setLoadAttempt((attempt) => attempt + 1);
  };

  // Keep the view and filters in the URL so they survive refreshes.
  useEffect(() => {
    const params = new URLSearchParams();

    if (view !== 'overview') {
      params.set('view', view);
    }

    if (filters.platform !== 'all') {
      params.set('platform', filters.platform);
    }

    if (filters.status !== 'all') {
      params.set('status', filters.status);
    }

    if (filters.search.trim()) {
      params.set('search', filters.search.trim());
    }

    if (filters.scheduledDate) {
      params.set('date', filters.scheduledDate);
    }

    const query = params.toString();
    const nextUrl = query
      ? `${window.location.pathname}?${query}`
      : window.location.pathname;

    window.history.replaceState(null, '', nextUrl);
  }, [filters, view]);

  useEffect(() => {
    const handlePopState = () => {
      setFilters(readFiltersFromUrl());
      setView(readViewFromUrl());
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const matchesPlatform =
        filters.platform === 'all' ||
        post.platforms.includes(filters.platform);

      // Keep a post visible under "Failed" while it is being retried,
      // otherwise the optimistic update would make it vanish mid-retry.
      const matchesStatus =
        filters.status === 'all' ||
        post.status === filters.status ||
        (filters.status === 'failed' && retryingPostIds.includes(post.id));

      const matchesSearch = (post.content ?? '')
        .toLowerCase()
        .includes(filters.search.trim().toLowerCase());

      const matchesDate =
        !filters.scheduledDate ||
        getLocalDateKey(post.scheduledAt) === filters.scheduledDate;

      return (
        matchesPlatform &&
        matchesStatus &&
        matchesSearch &&
        matchesDate
      );
    });
  }, [posts, filters, retryingPostIds]);

  const closeToast = useCallback(() => setToast(null), []);
  const closeComposer = useCallback(() => setIsComposerOpen(false), []);

  const handleSearchChange = (search: string) => {
    setFilters((current) => ({ ...current, search }));

    // Search results live in the queue, so take the user there.
    if (search.trim()) {
      setView('queue');
    }
  };

  const handleViewFailed = () => {
    setFilters({ platform: 'all', status: 'failed', search: '', scheduledDate: '' });
    setView('queue');
  };

  const handleSelectDate = (scheduledDate: string) => {
    setFilters((current) => ({ ...current, scheduledDate }));
    setView('queue');
  };

  const handleCreatePost = (newPost: SocialPost) => {
    setPosts((currentPosts) => [...currentPosts, newPost]);
    setIsComposerOpen(false);

    setToast({
      id: Date.now(),
      message: 'Post scheduled successfully!',
      type: 'success',
    });
  };

  const handleRetry = async (postId: string) => {
    const failedPost = posts.find((post) => post.id === postId);

    if (
      !failedPost ||
      failedPost.status !== 'failed' ||
      retryingPostIds.includes(postId)
    ) {
      return;
    }

    setRetryingPostIds((current) =>
      current.includes(postId) ? current : [...current, postId],
    );

    // Optimistically mark the post as scheduled.
    setPosts((currentPosts) =>
      currentPosts.map((post) =>
        post.id === postId
          ? { ...post, status: 'scheduled', errorMessage: undefined }
          : post,
      ),
    );

    try {
      await retryPublish(postId);

      setToast({
        id: Date.now(),
        message: 'Post retry successful!',
        type: 'success',
      });
    } catch {
      // Roll back to exactly how the post looked before the retry.
      setPosts((currentPosts) =>
        currentPosts.map((post) => (post.id === postId ? failedPost : post)),
      );

      setToast({
        id: Date.now(),
        message: 'Retry failed. The post is still marked as failed, please try again.',
        type: 'error',
      });
    } finally {
      setRetryingPostIds((current) =>
        current.filter((id) => id !== postId),
      );
    }
  };

  const isReady = !isLoading && !loadError;

  return (
    <div className="min-h-screen bg-gray-50 lg:flex">
      <Toast toast={toast} onClose={closeToast} />

      <Sidebar activeView={view} onNavigate={setView} />

      <div className="flex min-w-0 flex-1 flex-col">
        <MobileNav
          activeView={view}
          onNavigate={setView}
          search={filters.search}
          onSearchChange={handleSearchChange}
        />

        <Header
          title={viewTitles[view]}
          subtitle={`${formatToday()}. Times shown in ${getTimeZone()}`}
          search={filters.search}
          onSearchChange={handleSearchChange}
          onCreatePost={() => setIsComposerOpen(true)}
          isCreateDisabled={!isReady}
        />

        <main className="flex-1 px-4 py-6 sm:px-8 lg:py-8 xl:px-10">
          {isLoading && <LoadingState />}

          {!isLoading && loadError && (
            <ErrorState message={loadError} onRetry={handleReload} />
          )}

          {isReady && view === 'overview' && (
            <Overview
              posts={posts}
              retryingPostIds={retryingPostIds}
              onRetry={handleRetry}
              onViewFailed={handleViewFailed}
            />
          )}

          {isReady && view === 'queue' && (
            <div className="space-y-6">
              <PostFilters
                platform={filters.platform}
                status={filters.status}
                scheduledDate={filters.scheduledDate}
                onScheduledDateChange={(scheduledDate) =>
                  setFilters((current) => ({ ...current, scheduledDate }))
                }
                onPlatformChange={(platform) =>
                  setFilters((current) => ({ ...current, platform }))
                }
                onStatusChange={(status) =>
                  setFilters((current) => ({ ...current, status }))
                }
              />

              <PostQueue
                posts={filteredPosts}
                onRetry={handleRetry}
                retryingPostIds={retryingPostIds}
              />
            </div>
          )}

          {isReady && view === 'calendar' && (
            <CalendarView posts={posts} onSelectDate={handleSelectDate} />
          )}
        </main>
      </div>

      {isComposerOpen && (
        <PostComposer onCreatePost={handleCreatePost} onClose={closeComposer} />
      )}
    </div>
  );
}
