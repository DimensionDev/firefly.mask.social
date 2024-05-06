import { SocialPlatform } from '@/constants/enum.js';
import type { Channel } from '@/providers/types/SocialMedia.js';

export const HOME_CHANNEL: Channel = {
    name: 'Home',
    id: '', // empty id used as home channel id
    imageUrl: '',
    source: SocialPlatform.Farcaster,
    url: '',
    parentUrl: '',
    followerCount: 0,
    timestamp: 0,
};

export const CHANNEL_SEARCH_LIST_SIZE = 10;
export const FF_GARDEN_CHANNEL_ID = 'firefly-garden';
