# Flintzy Scheduler

A social media post scheduler built with React, TypeScript, Vite and Tailwind CSS. You can browse a queue of posts, filter and search them, compose new posts for several platforms at once, and retry posts that failed to publish.

There is no backend. Posts are loaded from a JSON file through a small simulated API, so the app runs on its own with no setup beyond `npm install`.

## Running the app

**Requirements:** Node.js 20.19+ or 22.12+ (required by Vite 8) and npm.

```bash
npm install       # install dependencies
npm run dev       # start the dev server at http://localhost:5173
```

Other scripts:

| Command | What it does |
|---|---|
| `npm run build` | Type-checks with `tsc`, then builds a production bundle into `dist/` |
| `npm run preview` | Serves the production build locally (run `npm run build` first) |
| `npm run lint` | Runs ESLint |

### Trying specific states

| To see | Open |
|---|---|
| The error state | `http://localhost:5173/?simulate=load-error`. The first load fails; **Try again** recovers. |
| A filtered queue | `http://localhost:5173/?view=queue&platform=x&status=scheduled&search=week` |
| A failed retry | Press **Retry** on any failed post. 1 in 5 attempts fails at random, so try a few times. |
| The mobile layout | Use your browser's device toolbar at any width below 1024px. |

## Features

| # | Requirement | Where to find it |
|---|---|---|
| 1 | Queue grouped by day (Today, Tomorrow, then dates) with content preview, platform icons, scheduled time and status | **Post Queue** page |
| 2 | Filter by platform and status, search by content, filters kept after a refresh | Filters on the Post Queue page; search in the header. Everything is stored in the URL. |
| 3 | Composer with text, multiple platforms, optional image URL and a date-time picker | **Create post** button in the header |
| 4 | Live character counter per selected platform (X 280, Instagram 2,200, TikTok 2,200, Facebook 5,000); scheduling blocked if any platform is over | Inside the composer |
| 5 | Scheduled time must be in the future; stored in UTC, shown in the user's local time zone | Composer validation; every displayed time |
| 6 | Retry failed posts: instant UI update, 1-second simulated call that fails 20% of the time, rollback with an error message | **Retry** button on failed posts (Overview and Post Queue) |
| 7 | Loading, empty and error states; responsive on mobile and desktop | Throughout |

Beyond the brief, there is also:

- An **Overview** dashboard with post totals, a "Needs attention" list of failed posts and a breakdown of scheduled posts per platform.
- A **Calendar** month view. Clicking a day opens its posts in the queue, and "+N more" shows the full day in a popover.

## Project structure

```
src/
  api/posts.ts          Simulated API: loading posts and retrying a publish
  data/posts.json       Seed data (30 posts)
  types/post.ts         SocialPost, SocialPlatform, PostStatus types
  constants/platforms.ts  Platform names and colours
  utils/dateUtils.ts    UTC/local time conversion, formatting and day grouping
  components/
    Header.tsx          Page title, search, Create post button
    Sidebar.tsx         Desktop sidebar, plus the mobile top bar and slide-out menu
    Overview.tsx        Dashboard page
    PostQueue.tsx       Queue grouped by day
    PostCard.tsx        A single post, including the retry UI
    PostFilters.tsx     Date, platform and status filters
    Select.tsx          Accessible custom dropdown used by the filters
    PostComposer.tsx    Slide-in panel for creating a post
    CalendarView.tsx    Month calendar with the "+N more" popover
    LoadStates.tsx      Loading skeleton and error state
    Toast.tsx           Success and error notifications
    PlatformBadge.tsx, StatusPill.tsx, Icons.tsx
  App.tsx               App state, URL syncing, filtering and retry logic
```

## Key decisions

### State and data

- **Plain React state, no state library.** All state lives in `App.tsx` and is passed down as props. The app is small enough that Redux or Zustand would add more structure than they save.
- **A simulated API layer** (`src/api/posts.ts`). Loading and retrying go through `fetchPosts()` and `retryPublish()`, which return promises with realistic delays. The UI already handles real async behaviour, so swapping in a real backend means changing only this file.
- **Seed data is validated on load.** `fetchPosts()` checks every post's shape (known platforms and statuses, a parseable date). Bad data shows the error state instead of crashing the page.
- **New posts are kept in memory only.** Refreshing the page resets to the seed data. Persisting to `localStorage` was left out on purpose so that refreshes always start from a known state.

### Filters in the URL

- The URL is the source of truth for filters. Platform, status, search, date and the current page are written to the query string with `history.replaceState`, so a refresh or a shared link restores the same view.
- Values read from the URL are validated. An unknown platform or status, or an invalid date, falls back to "all" instead of breaking the page.
- `replaceState` is used rather than `pushState`, so typing in the search box doesn't flood the browser history with an entry per keystroke.
- Typing in the search box switches to the Post Queue, since that is where search results are shown.

### Dates and time zones

- Times are stored as UTC ISO strings (`2026-10-22T16:42:00.000Z`). The `datetime-local` input gives a local time, which is converted with `Date.prototype.toISOString()`.
- All formatting uses `Intl.DateTimeFormat` with the browser's time zone, which is shown in the header ("Times shown in Asia/Calcutta").
- Grouping into Today, Tomorrow and later dates compares local calendar days, not UTC days, so a post at 1 AM local time lands on the correct day.
- The future-time rule is checked twice: live, to disable the Schedule button, and again on submit, in case the chosen time passes while the form is open.

### Character counting

- Characters are counted as people see them (grapheme clusters, via `Intl.Segmenter`), so an emoji counts as 1 rather than 2.
- The counter uses the trimmed text, because that is what gets saved.
- **Known simplification:** X's own counter gives some characters (emoji, CJK) and every link a weight of 2. The app doesn't replicate that weighting.

### Retrying failed posts

- **Optimistic update with snapshot rollback.** The post switches to "scheduled" immediately. If the simulated call rejects, the post is restored from a snapshot taken before the retry, keeping its original error, and an error toast is shown.
- **Retrying posts stay visible.** A post being retried stays on screen under the "Failed" filter and in "Needs attention", so you can see the "Retrying..." state instead of the post disappearing.
- **No double retries.** The button is disabled while a retry is in flight, and the handler ignores repeat calls for the same post.

### Loading, empty and error states

- The page layout (sidebar and header) stays visible in every state; only the content area changes. Loading shows skeleton cards shaped like the real content.
- **Create post** is disabled until posts have loaded. Otherwise a post made during loading would be overwritten when the data arrives.
- The error state is reached with `?simulate=load-error`. Only the first attempt fails, so **Try again** demonstrates recovery.

### UI and responsiveness

- **Tailwind CSS v4, no component library.** This keeps the bundle small and the design fully under our control. Icons are inline SVGs.
- **Desktop (1024px and up):** a fixed sidebar. **Below 1024px:** a sticky top bar with a search toggle and a menu button that opens the navigation from the left.
- **The composer is a slide-in panel**, not a centred modal. It has room for the counters and keeps the action buttons pinned to the bottom.
- **A custom dropdown for the filters** (`Select.tsx`), because native `<select>` menus can't be styled to match the theme. It follows the ARIA "select-only combobox" pattern and supports full keyboard use (arrow keys, Home/End, Enter, Esc, type-ahead). The native date pickers were kept as they are.

### Accessibility

- Dialogs and panels use `role="dialog"` and `aria-modal`, close with Esc, and lock page scrolling behind them.
- Success toasts are announced politely and error toasts assertively. The loading state is announced to screen readers.
- Platform icons have accessible names, except where the platform name is already written next to them.
- Animations are turned off for users who have reduced motion enabled.

## Known limitations

- No backend or persistence: new posts are lost on refresh.
- No automated test suite in the repository. The requirements were checked by hand and with a headless-browser script during development.
- The workspace avatar ("AR") is a placeholder; there is no authentication.
- X's weighted character counting isn't implemented (see [Character counting](#character-counting)).
