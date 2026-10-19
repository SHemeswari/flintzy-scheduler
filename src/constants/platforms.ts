import type { SocialPlatform } from '../types/post';

export const PLATFORMS: SocialPlatform[] = ['facebook', 'instagram', 'x', 'tiktok'];

interface PlatformMeta {
  label: string;
  iconClass: string;
  barClass: string;
}

export const platformMeta: Record<SocialPlatform, PlatformMeta> = {
  facebook: {
    label: 'Facebook',
    iconClass: 'text-[#1877F2]',
    barClass: 'bg-[#1877F2]',
  },
  instagram: {
    label: 'Instagram',
    iconClass: 'text-[#C2306F]',
    barClass: 'bg-[#C2306F]',
  },
  x: {
    label: 'X',
    iconClass: 'text-gray-900',
    barClass: 'bg-gray-900',
  },
  tiktok: {
    label: 'TikTok',
    iconClass: 'text-black',
    barClass: 'bg-[#0F8B8D]',
  },
};
