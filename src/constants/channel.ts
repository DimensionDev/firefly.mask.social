import { Source } from '@/constants/enum.js';
import type { Channel } from '@/providers/types/SocialMedia.js';

export const HOME_CHANNEL: Channel = {
    name: 'Home',
    id: 'home', // home channel id is empty
    imageUrl: '',
    url: '',
    parentUrl: '',
    followerCount: 0,
    timestamp: 0,
    source: Source.Farcaster,
};

export const FF_GARDEN_CHANNEL: Channel = {
    name: 'firefly-garden',
    id: 'firefly-garden',
    imageUrl: 'https://i.imgur.com/NfzIpwa.jpg',
    url: 'https://warpcast.com/~/channel/firefly-garden',
    parentUrl: 'https://warpcast.com/~/channel/firefly-garden',
    followerCount: 489, // @warn: may change
    timestamp: 1703399720,
    source: Source.Farcaster,
};
