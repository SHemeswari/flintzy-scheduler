
import { PlusIcon, SearchIcon } from './Icons';

interface HeaderProps {
  title: string;
  subtitle: string;
  search: string;
  onSearchChange: (search: string) => void;
  onCreatePost: () => void;
  isCreateDisabled?: boolean;
}

export default function Header({
  title,
  subtitle,
  search,
  onSearchChange,
  onCreatePost,
  isCreateDisabled = false,
}: HeaderProps) {
  return (
    <header className="flex items-center justify-between gap-4 border-b border-gray-200 bg-white/95 px-4 py-3 backdrop-blur sm:px-8 lg:sticky lg:top-0 lg:z-30">
      <div className="min-w-0">
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
          {title}
        </h1>
        <p className="mt-0.5 text-sm text-gray-500">{subtitle}</p>
      </div>

      {/* Below lg the search lives in the mobile top bar instead. */}
      <div className="flex shrink-0 items-center gap-3 lg:min-w-0 lg:flex-1 lg:justify-end">
        <label className="relative hidden min-w-0 flex-1 lg:block lg:max-w-80 xl:max-w-[400px]">
          <span className="sr-only">Search post text</span>
          <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search post text"
            className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-11 pr-4 text-[15px] text-gray-900 outline-none placeholder:text-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          />
        </label>

        <button
          type="button"
          onClick={onCreatePost}
          disabled={isCreateDisabled}
          className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-indigo-500 px-4 py-3 text-[15px] font-semibold text-white shadow-sm transition hover:bg-indigo-600 disabled:cursor-not-allowed disabled:opacity-60 sm:px-5"
        >
          <PlusIcon className="h-5 w-5" />
          <span className="hidden sm:inline">Create post</span>
          <span className="sr-only sm:hidden">Create post</span>
        </button>

        <span
          className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-sm font-semibold text-indigo-700 sm:flex"
          title="Demo workspace"
        >
          AR
        </span>
      </div>
    </header>
  );
}
