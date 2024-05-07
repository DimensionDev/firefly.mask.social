import  { type SocialSource, Source } from '@/constants/enum.js';
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
export const HOME_CHANNEL: Record<SocialSource, Channel> = {
    [Source.Farcaster]: { ...HOME_CHANNEL_BASE, source: Source.Farcaster },
    [Source.Lens]: { ...HOME_CHANNEL_BASE, source: Source.Lens },
    [Source.Twitter]: { ...HOME_CHANNEL_BASE, source: Source.Twitter },
};

export const FF_GARDEN_CHANNEL: Record<SocialSource, Channel | null> = {
    [Source.Farcaster]: {
        name: 'firefly-garden',
        id: 'firefly-garden',
        imageUrl: 'https://i.imgur.com/NfzIpwa.jpg',
        source: Source.Farcaster,
        url: 'https://warpcast.com/~/channel/firefly-garden',
        parentUrl: 'https://warpcast.com/~/channel/firefly-garden',
        followerCount: 489, // @warn: may change
        timestamp: 1703399720,
    },
    [Source.Lens]: null,
    [Source.Twitter]: null,
};

export const CHANNEL_SEARCH_LIST_SIZE = 10;
export const CURRENT_SOURCE_WITH_CHANNEL_SUPPORT = Source.Farcaster;
