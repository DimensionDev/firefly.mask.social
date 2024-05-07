import { SocialPlatform } from '@/constants/enum.js';
import type { Channel } from '@/providers/types/SocialMedia.js';

export const HOME_CHANNEL_BASE: Omit<Channel, 'source'> = {
    name: 'Home',
    id: '', // home channel id is empty
    imageUrl: '',
    url: '',
    parentUrl: '',
    followerCount: 0,
    timestamp: 0,
};
export const HOME_CHANNEL: Record<SocialPlatform, Channel> = {
    [SocialPlatform.Farcaster]: { ...HOME_CHANNEL_BASE, source: SocialPlatform.Farcaster },
    [SocialPlatform.Lens]: { ...HOME_CHANNEL_BASE, source: SocialPlatform.Lens },
    [SocialPlatform.Twitter]: { ...HOME_CHANNEL_BASE, source: SocialPlatform.Twitter },
};

export const FF_GARDEN_CHANNEL: Record<SocialPlatform, Channel | null> = {
    [SocialPlatform.Farcaster]: {
        name: 'firefly-garden',
        id: 'firefly-garden',
        imageUrl: 'https://i.imgur.com/NfzIpwa.jpg',
        source: SocialPlatform.Farcaster,
        url: 'https://warpcast.com/~/channel/firefly-garden',
        parentUrl: 'https://warpcast.com/~/channel/firefly-garden',
        followerCount: 489, // @warn: may change 
        timestamp: 1703399720,
    },
    [SocialPlatform.Lens]: null,
    [SocialPlatform.Twitter]: null,
};

export const CHANNEL_SEARCH_LIST_SIZE = 10;
export const CURRENT_SOURCE_WITH_CHANNEL_SUPPORT = SocialPlatform.Farcaster;
