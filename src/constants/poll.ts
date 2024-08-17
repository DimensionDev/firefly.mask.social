import { type SocialSource, Source } from '@/constants/enum.js';

// poll default options count
export const POLL_OPTIONS_MIN_COUNT = 2;

// poll default valid in days
export const POLL_DEFAULT_VALID_IN_DAYS = 1;

// poll option max characters
export const POLL_PEER_OPTION_MAX_CHARS = 25;

export const POLL_DURATION_DAYS_LIST = [0, 1, 2, 3, 4, 5, 6, 7];

export const POLL_DURATION_MIN_MINUTES = 5;

export enum POLL_CHOICE_TYPE {
    Single = 'single-choice',
    Multiple = 'multiple-choice',
}

export enum POLL_STRATEGIES {
    None = '[]',
}

export const POLL_OPTIONS_MAX_COUNT: Record<SocialSource, number> = {
    [Source.Lens]: 4,
    [Source.Farcaster]: 4,
    [Source.Twitter]: 4,
};

export const POLL_ACTION_ENABLED: Record<SocialSource, boolean> = {
    [Source.Lens]: true,
    [Source.Farcaster]: true,
    [Source.Twitter]: false,
};
