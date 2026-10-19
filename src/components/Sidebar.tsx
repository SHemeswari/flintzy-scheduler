
import { useEffect, useRef, useState, type ComponentType, type SVGProps } from 'react';
import {
  CalendarIcon,
  CloseIcon,
  GridIcon,
  ListIcon,
  MenuIcon,
  SearchIcon,
} from './Icons';

export type AppView = 'overview' | 'queue' | 'calendar';

interface NavProps {
  activeView: AppView;
  onNavigate: (view: AppView) => void;
}

const navItems: {
  id: AppView;
  label: string;
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
}[] = [
  { id: 'overview', label: 'Overview', Icon: GridIcon },
  { id: 'queue', label: 'Post Queue', Icon: ListIcon },
  { id: 'calendar', label: 'Calendar', Icon: CalendarIcon },
];

function Logo() {
  return (
    <div className="flex items-center gap-3">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500 text-lg font-bold text-white">
        F
      </span>
      <span className="text-xl font-bold tracking-tight text-gray-900">
        Flintzy
      </span>
    </div>
  );
}

function NavList({ activeView, onNavigate }: NavProps) {
  return (
    <nav aria-label="Main">
      <ul className="space-y-1">
        {navItems.map(({ id, label, Icon }) => {
          const isActive = activeView === id;

          return (
            <li key={id}>
              <button
                type="button"
                onClick={() => onNavigate(id)}
                aria-current={isActive ? 'page' : undefined}
                className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-[17px] font-medium transition ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-600'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? '' : 'text-gray-400'}`} />
                {label}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export default function Sidebar({ activeView, onNavigate }: NavProps) {
  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-gray-200 bg-white px-4 py-4 lg:flex xl:w-[304px]">
      <div className="px-2">
        <Logo />
      </div>

      <div className="mt-8">
        <NavList activeView={activeView} onNavigate={onNavigate} />
      </div>
    </aside>
  );
}

interface MobileNavProps extends NavProps {
  search: string;
  onSearchChange: (search: string) => void;
}

export function MobileNav({
  activeView,
  onNavigate,
  search,
  onSearchChange,
}: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  // Start open when a search is already active (e.g. restored from the URL).
  const [isSearchOpen, setIsSearchOpen] = useState(() => search.trim() !== '');
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const toggleSearch = () => {
    if (isSearchOpen) {
      setIsSearchOpen(false);
      return;
    }

    setIsSearchOpen(true);
    // Focus once the input has rendered.
    window.requestAnimationFrame(() => searchInputRef.current?.focus());
  };

  const clearSearch = () => {
    onSearchChange('');
    setIsSearchOpen(false);
  };

  const close = () => {
    setIsOpen(false);
    menuButtonRef.current?.focus();
  };

  // While open: close on Escape or when the screen grows to desktop size,
  // and stop the page behind the menu from scrolling.
  useEffect(() => {
    if (!isOpen) return;

    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        menuButtonRef.current?.focus();
      }
    };

    const desktopQuery = window.matchMedia('(min-width: 1024px)');
    const handleResize = () => {
      if (desktopQuery.matches) setIsOpen(false);
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);
    desktopQuery.addEventListener('change', handleResize);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
      desktopQuery.removeEventListener('change', handleResize);
    };
  }, [isOpen]);

  return (
    <div className="sticky top-0 z-30 border-b border-gray-200 bg-white lg:hidden">
      <div className="flex items-center justify-between gap-2 py-3 pl-4 pr-2 sm:pl-8 sm:pr-6">
        <Logo />

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={toggleSearch}
            aria-label={isSearchOpen ? 'Hide search' : 'Search posts'}
            aria-expanded={isSearchOpen}
            aria-controls="mobile-search"
            className={`rounded-lg p-2 hover:bg-gray-100 hover:text-gray-900 ${
              isSearchOpen || search ? 'text-indigo-600' : 'text-gray-700'
            }`}
          >
            <SearchIcon className="h-6 w-6" />
          </button>

          <button
            ref={menuButtonRef}
            type="button"
            onClick={() => setIsOpen(true)}
            aria-label="Open menu"
            aria-expanded={isOpen}
            aria-controls="mobile-menu"
            className="rounded-lg p-2 text-gray-700 hover:bg-gray-100 hover:text-gray-900"
          >
            <MenuIcon className="h-6 w-6" />
          </button>
        </div>
      </div>

      {isSearchOpen && (
        <div id="mobile-search" className="px-4 pb-3 sm:px-8">
          <label className="relative block">
            <span className="sr-only">Search post text</span>
            <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              ref={searchInputRef}
              type="search"
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Escape') clearSearch();
              }}
              placeholder="Search post text"
              className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-11 pr-11 text-[15px] text-gray-900 outline-none placeholder:text-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 [&::-webkit-search-cancel-button]:hidden"
            />
            <button
              type="button"
              onClick={clearSearch}
              aria-label="Clear and close search"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
            >
              <CloseIcon className="h-4 w-4" />
            </button>
          </label>
        </div>
      )}

      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-gray-900/40 motion-safe:animate-fade-in"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) close();
          }}
        >
          <aside
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            className="flex h-full w-72 max-w-[85vw] flex-col bg-white px-4 py-4 shadow-2xl motion-safe:animate-slide-in-left"
          >
            <div className="flex items-center justify-between px-2">
              <Logo />
              <button
                ref={closeButtonRef}
                type="button"
                onClick={close}
                aria-label="Close menu"
                className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-900"
              >
                <CloseIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-8">
              <NavList
                activeView={activeView}
                onNavigate={(view) => {
                  onNavigate(view);
                  close();
                }}
              />
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
