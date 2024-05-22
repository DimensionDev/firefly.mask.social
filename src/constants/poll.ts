import { Source, type SocialSource } from '@/constants/enum.js';

// poll default options count
export const POLL_OPTIONS_MIN_COUNT = 2;

// poll default valid in days
export const POLL_DEFAULT_VALID_IN_DAYS = 1;

// poll option max characters
export const POLL_PEER_OPTION_MAX_CHARS = 25;

export const POLL_VALID_IN_DAYS_DEFAULT_LIST = [1, 2, 3, 4, 5, 6];

export const POLL_OPTIONS_MAX_COUNT: Record<SocialSource, number> = {
    [Source.Lens]: 10,
    [Source.Farcaster]: 4,
    [Source.Twitter]: 4,
};

export const POLL_MAX_VALID_IN_DAYS: Record<SocialSource, number> = {
    [Source.Lens]: Number.MAX_SAFE_INTEGER,
    [Source.Farcaster]: Number.MAX_SAFE_INTEGER,
    [Source.Twitter]: 6,
};

export const POLL_ACTION_ENABLED: Record<SocialSource, boolean> = {
    [Source.Lens]: false,
    [Source.Farcaster]: false,
    [Source.Twitter]: false,
};
