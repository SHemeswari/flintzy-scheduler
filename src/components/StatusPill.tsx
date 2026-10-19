import type { PostStatus } from '../types/post';
import { AlertCircleIcon, CheckCircleIcon, ClockIcon, RetryIcon } from './Icons';

interface StatusPillProps {
  status: PostStatus;
  isRetrying?: boolean;
}

const statusConfig = {
  scheduled: { label: 'Scheduled', className: 'bg-indigo-50 text-indigo-600', Icon: ClockIcon },
  published: { label: 'Published', className: 'bg-green-50 text-green-700', Icon: CheckCircleIcon },
  failed: { label: 'Failed', className: 'bg-red-50 text-red-600', Icon: AlertCircleIcon },
};

export default function StatusPill({ status, isRetrying = false }: StatusPillProps) {
  if (isRetrying) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-sm font-medium text-amber-700">
        <RetryIcon className="h-3.5 w-3.5 animate-spin" />
        Retrying...
      </span>
    );
  }

  const { label, className, Icon } = statusConfig[status];

  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-sm font-medium ${className}`}>
      <Icon className="h-3.5 w-3.5" />
      {label}
    </span>
  );
}
