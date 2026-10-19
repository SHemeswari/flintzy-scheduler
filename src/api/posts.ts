import initialPosts from '../data/posts.json';
import type { SocialPost } from '../types/post';
import { PLATFORMS } from '../constants/platforms';

const LOAD_DELAY_MS = 600;
const RETRY_DELAY_MS = 1000;
const RETRY_FAILURE_RATE = 0.2;

const VALID_STATUSES = ['scheduled', 'published', 'failed'];

// Open the app with ?simulate=load-error to see the error state.
// Only the first attempt fails, so "Try again" recovers.
const simulateLoadError =
  new URLSearchParams(window.location.search).get('simulate') === 'load-error';

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function isOptionalString(value: unknown): boolean {
  return value === undefined || typeof value === 'string';
}

function isSocialPost(value: unknown): value is SocialPost {
  if (typeof value !== 'object' || value === null) return false;

  const post = value as Record<string, unknown>;

  return (
    typeof post.id === 'string' &&
    typeof post.content === 'string' &&
    Array.isArray(post.platforms) &&
    post.platforms.length > 0 &&
    post.platforms.every((platform) => PLATFORMS.includes(platform)) &&
    typeof post.scheduledAt === 'string' &&
    !Number.isNaN(Date.parse(post.scheduledAt)) &&
    VALID_STATUSES.includes(post.status as string) &&
    isOptionalString(post.mediaUrl) &&
    isOptionalString(post.errorMessage)
  );
}

/**
 * Simulate loading the user's posts from an API.
 */
export async function fetchPosts(attempt: number): Promise<SocialPost[]> {
  await wait(LOAD_DELAY_MS);

  if (simulateLoadError && attempt === 0) {
    throw new Error("We couldn't reach the server. Check your connection and try again.");
  }

  const data: unknown = initialPosts;

  if (!Array.isArray(data) || !data.every(isSocialPost)) {
    throw new Error('Your posts could not be read. Please try again later.');
  }

  return data;
}

/**
 * Simulate asking the API to publish a failed post again.
 * Rejects 20% of the time.
 */
export async function retryPublish(postId: string): Promise<void> {
  await wait(RETRY_DELAY_MS);

  if (Math.random() < RETRY_FAILURE_RATE) {
    throw new Error(`Retry failed for post ${postId}.`);
  }
}
