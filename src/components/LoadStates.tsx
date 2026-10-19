
import { AlertCircleIcon, RetryIcon } from './Icons';

function SkeletonBlock({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-md bg-gray-200/70 ${className}`} />;
}

export function LoadingState() {
  return (
    <div role="status" aria-live="polite" className="space-y-8">
      <span className="sr-only">Loading your posts...</span>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <SkeletonBlock className="h-4 w-24" />
            <SkeletonBlock className="mt-4 h-8 w-12" />
            <SkeletonBlock className="mt-3 h-3 w-32" />
          </div>
        ))}
      </div>

      <div className="divide-y divide-gray-200 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        {Array.from({ length: 3 }, (_, index) => (
          <div key={index} className="flex gap-4 px-4 py-5 sm:px-6">
            <div className="min-w-0 flex-1">
              <div className="flex gap-2">
                <SkeletonBlock className="h-6 w-6" />
                <SkeletonBlock className="h-6 w-20 rounded-full" />
                <SkeletonBlock className="h-6 w-40" />
              </div>
              <SkeletonBlock className="mt-4 h-4 w-full max-w-xl" />
              <SkeletonBlock className="mt-2 h-4 w-2/3 max-w-md" />
            </div>
            <SkeletonBlock className="h-16 w-16 shrink-0 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
}

interface ErrorStateProps {
  message: string;
  onRetry: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <section
      role="alert"
      className="mx-auto max-w-lg rounded-2xl border border-gray-200 bg-white px-6 py-12 text-center shadow-sm"
    >
      <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
        <AlertCircleIcon className="h-6 w-6" />
      </span>

      <h2 className="mt-4 text-lg font-semibold text-gray-900">
        Couldn't load your posts
      </h2>
      <p className="mt-2 text-sm text-gray-500">{message}</p>

      <button
        type="button"
        onClick={onRetry}
        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-600"
      >
        <RetryIcon className="h-4 w-4" />
        Try again
      </button>
    </section>
  );
}
