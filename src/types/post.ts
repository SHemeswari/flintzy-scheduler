
export type SocialPlatform =
  | 'facebook'
  | 'instagram'
  | 'x'
  | 'tiktok';

export type PostStatus =
  | 'scheduled'
  | 'published'
  | 'failed';

export interface SocialPost {
  id: string;
  content: string;
  platforms: SocialPlatform[];
  mediaUrl?: string;
  scheduledAt: string;
  status: PostStatus;
  errorMessage?: string;
}
