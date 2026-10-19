
import { useEffect } from 'react';

export type ToastType = 'success' | 'error';

export interface ToastMessage {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastProps {
  toast: ToastMessage | null;
  onClose: () => void;
}

export default function Toast({ toast, onClose }: ToastProps) {
  useEffect(() => {
    if (!toast) return;

    const timer = window.setTimeout(onClose, 3500);
    return () => window.clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  const isSuccess = toast.type === 'success';

  return (
    <div
      className="fixed right-4 top-4 z-50 w-[calc(100%-2rem)] max-w-sm sm:right-6 sm:top-6"
      role={isSuccess ? 'status' : 'alert'}
      aria-live={isSuccess ? 'polite' : 'assertive'}
    >
      <div
        className={`flex items-start gap-3 rounded-xl border bg-white p-4 shadow-lg ${
          isSuccess ? 'border-green-200' : 'border-red-200'
        }`}
      >
        <div
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
            isSuccess
              ? 'bg-green-100 text-green-700'
              : 'bg-red-100 text-red-700'
          }`}
          aria-hidden="true"
        >
          {isSuccess ? '✓' : '✕'}
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-gray-900">
            {isSuccess ? 'Success' : 'Something went wrong'}
          </p>
          <p className="mt-1 break-words text-sm text-gray-600">
            {toast.message}
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Dismiss notification"
          className="rounded-md px-2 py-1 text-gray-500 hover:bg-gray-100 hover:text-gray-900"
        >
          ×
        </button>
      </div>
    </div>
  );
}
