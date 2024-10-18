import { type SocialSource, Source } from '@/constants/enum.js';

type Limitation = Record<SocialSource, number>;

export const MAX_CHAR_SIZE_PER_POST: Limitation = {
    [Source.Farcaster]: 1024,
    [Source.Lens]: 5000,
    [Source.Twitter]: 280,
};

export const MAX_CHAR_SIZE_VERIFY_PER_POST: Limitation = {
    [Source.Farcaster]: 1024,
    [Source.Lens]: 5000,
    [Source.Twitter]: 25000,
};

export const MAX_IMAGE_SIZE_PER_POST: Limitation = {
    [Source.Farcaster]: 2,
    [Source.Lens]: 20,
    [Source.Twitter]: 4,
};

export const MAX_FILE_SIZE_PER_IMAGE: Limitation = {
    [Source.Twitter]: 5 * 1024 * 1024, // 5MB
    [Source.Lens]: 100 * 1024 * 1024, // 100MB
    [Source.Farcaster]: 100 * 1024 * 1024, // 100MB
};

export const MAX_FILE_SIZE_PER_GIF: Limitation = {
    [Source.Twitter]: 15 * 1024 * 1024, // 15MB
    [Source.Lens]: 15 * 1024 * 1024, // 15MB
    [Source.Farcaster]: 15 * 1024 * 1024, // 15MB
};

// https://mask.atlassian.net/browse/FW-2212
export const MAX_FILE_SIZE_PER_VIDEO: Limitation = {
    [Source.Twitter]: 512 * 1024 * 1024, // 512MB
    [Source.Lens]: 1024 * 1024 * 1024, // 1GB
    [Source.Farcaster]: 1024 * 1024 * 1024, // 1GB
};

export const MIN_DURATION_PER_VIDEO: Limitation = {
    [Source.Twitter]: 0.5,
    [Source.Lens]: 0,
    [Source.Farcaster]: 0,
};

export const MAX_DURATION_PER_VIDEO: Limitation = {
    [Source.Twitter]: Infinity,
    [Source.Lens]: Infinity,
    [Source.Farcaster]: Infinity,
};

export const MIN_WIDTH_PER_VIDEO: Limitation = {
    [Source.Twitter]: 32,
    [Source.Lens]: 32,
    [Source.Farcaster]: 32,
};

export const MAX_WIDTH_PER_VIDEO: Limitation = {
    [Source.Twitter]: Infinity,
    [Source.Lens]: 4096,
    [Source.Farcaster]: 4096,
};

export const MIN_HEIGHT_PER_VIDEO: Limitation = {
    [Source.Twitter]: 32,
    [Source.Lens]: 32,
    [Source.Farcaster]: 32,
};

export const MAX_HEIGHT_PER_VIDEO: Limitation = {
    [Source.Twitter]: Infinity,
    [Source.Lens]: 4096,
    [Source.Farcaster]: 4096,
};

// update profile
export const MAX_PROFILE_BIO_SIZE: Limitation = {
    [Source.Farcaster]: 160,
    [Source.Lens]: 260,
    [Source.Twitter]: 160,
};

export const MAX_PROFILE_DISPLAY_NAME_SIZE: Limitation = {
    [Source.Farcaster]: 32,
    [Source.Lens]: 100,
    [Source.Twitter]: 50,
};

export const MAX_PROFILE_LOCATION_SIZE: Limitation = {
    [Source.Farcaster]: 0,
    [Source.Lens]: 100,
    [Source.Twitter]: 30,
};

export const MAX_PROFILE_WEBSITE_SIZE: Limitation = {
    [Source.Farcaster]: 0,
    [Source.Lens]: 100,
    [Source.Twitter]: 100,
};
