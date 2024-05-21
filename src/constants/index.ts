/* cspell:disable */

import type { TweetV2UserTimelineParams } from 'twitter-api-v2';

import {
    EngagementType,
    NODE_ENV,
    ProfileTabType,
    RestrictionType,
    SearchType,
    type SocialSource,
    Source,
    VERCEL_NEV,
} from '@/constants/enum.js';
import { env } from '@/constants/env.js';

export const SITE_NAME = 'Firefly: All in one social app';
export const SITE_DESCRIPTION =
    "Firefly is a social app for exploring what's happening in the world of Web3, NFTs, AI, and more.";
export const SITE_URL = env.external.NEXT_PUBLIC_SITE_URL;
export const SITE_HOSTNAME = 'firefly.mask.social';

export const FARCASTER_REPLY_URL = 'https://relay.farcaster.xyz';
export const WARPCAST_ROOT_URL = 'https://api.warpcast.com/v2';
export const WARPCAST_CLIENT_URL = 'https://client.warpcast.com/v2';
export const FIREFLY_ROOT_URL = env.external.NEXT_PUBLIC_FIREFLY_API_URL;
export const FIREFLY_STAMP_URL = 'https://stamp.firefly.land/avatar';

export const FARCASTER_REPLY_COUNTDOWN = 50; // in seconds

export const HUBBLE_URL = env.internal.HUBBLE_URL ?? env.external.NEXT_PUBLIC_HUBBLE_URL;

export const NEYNAR_URL = 'https://api.neynar.com';
export const RP_HASH_TAG = '#FireflyLuckyDrop';

export const SORTED_PROFILE_TAB_TYPE: Record<SocialSource, ProfileTabType[]> = {
    [Source.Lens]: [ProfileTabType.Feed, ProfileTabType.Replies, ProfileTabType.Media, ProfileTabType.Collected],
    [Source.Farcaster]: [ProfileTabType.Feed, ProfileTabType.Replies, ProfileTabType.Liked, ProfileTabType.Channels],
    [Source.Twitter]: [ProfileTabType.Feed],
};
export const SORTED_ENGAGEMENT_TAB_TYPE: Record<SocialSource, EngagementType[]> = {
    [Source.Lens]: [EngagementType.Likes, EngagementType.Quotes, EngagementType.Mirrors],
    // TODO No API to fetch recasts for now.
    [Source.Farcaster]: [EngagementType.Likes, EngagementType.Quotes, EngagementType.Recasts],
    [Source.Twitter]: [EngagementType.Likes, EngagementType.Quotes],
};
export const SORTED_SEARCH_TYPE: Record<SocialSource, SearchType[]> = {
    [Source.Lens]: [SearchType.Posts, SearchType.Users],
    [Source.Farcaster]: [SearchType.Posts, SearchType.Users, SearchType.Channels],
    [Source.Twitter]: [SearchType.Posts, SearchType.Users],
};
export const SORTED_HOME_SOURCES = [Source.Farcaster, Source.Lens, Source.Article] as const;
export const SORTED_PROFILE_SOURCES = [Source.Farcaster, Source.Lens, Source.Twitter, Source.Wallet];
export const SORTED_SOCIAL_SOURCES = [Source.Farcaster, Source.Lens, Source.Twitter] as const;
export const SORTED_BOOKMARK_SOURCES =
    env.shared.NODE_ENV === NODE_ENV.Development
        ? [Source.Farcaster, Source.Lens, Source.Twitter, Source.Article]
        : [Source.Farcaster, Source.Lens, Source.Article];
export const SORTED_CHANNEL_SOURCES: SocialSource[] = [Source.Farcaster];
export const SORTED_RESTECTION_TYPE = [RestrictionType.Everyone, RestrictionType.OnlyPeopleYouFollow];
export const SORTED_POLL_SOURCES: SocialSource[] = [Source.Twitter];

// Lens
export const IPFS_GATEWAY = 'https://ipfs.io/ipfs/';
export const ARWEAVE_GATEWAY = 'https://arweave.net/';
export const LENS_MEDIA_SNAPSHOT_URL = 'https://ik.imagekit.io/lens/media-snapshot';
export const HEY_URL = 'https://hey.xyz';
export const HEY_API_URL = 'https://api.hey.xyz';

// Named transforms for ImageKit
export const AVATAR = 'tr:w-300,h-300';
export const EXPANDED_AVATAR = 'tr:w-1000,h-1000';
export const COVER = 'tr:w-1500,h-500';
export const ATTACHMENT = 'tr:w-1000';

export const IS_PRODUCTION = env.external.NEXT_PUBLIC_VERCEL_ENV === VERCEL_NEV.Production;
export const IS_DEVELOPMENT = env.external.NEXT_PUBLIC_VERCEL_ENV === VERCEL_NEV.Development;
export const IS_PREVIEW = env.external.NEXT_PUBLIC_VERCEL_ENV === VERCEL_NEV.Preview;

export const EVER_API = 'https://endpoint.4everland.co';

// S3 bucket
export const S3_BUCKET = {
    HEY_MEDIA: 'hey-media',
    FIREFLY_LENS_MEDIA: 'firefly-lens-media',
};

export const MAX_CHAR_SIZE_PER_POST: Record<SocialSource, number> = {
    [Source.Farcaster]: 320,
    [Source.Lens]: 5000,
    [Source.Twitter]: 280,
};
export const MAX_IMAGE_SIZE_PER_POST: Record<SocialSource, number> = {
    [Source.Farcaster]: 2,
    [Source.Lens]: 4,
    [Source.Twitter]: 4,
};
export const DANGER_CHAR_LIMIT: Record<SocialSource, number> = {
    [Source.Lens]: Math.floor(MAX_CHAR_SIZE_PER_POST[Source.Lens] * 0.9),
    [Source.Farcaster]: Math.floor(MAX_CHAR_SIZE_PER_POST[Source.Farcaster] * 0.9),
    [Source.Twitter]: Math.floor(MAX_CHAR_SIZE_PER_POST[Source.Twitter] * 0.9),
};
export const SAFE_CHAR_LIMIT: Record<SocialSource, number> = {
    [Source.Lens]: Math.floor(MAX_CHAR_SIZE_PER_POST[Source.Lens] * 0.8),
    [Source.Farcaster]: Math.floor(MAX_CHAR_SIZE_PER_POST[Source.Farcaster] * 0.8),
    [Source.Twitter]: Math.floor(MAX_CHAR_SIZE_PER_POST[Source.Twitter] * 0.8),
};

// Search Bar
export const MAX_SEARCH_RECORD_SIZE = 5;
export const MAX_RECOMMEND_PROFILE_SIZE = 10;

// POST
export const MAX_OG_SIZE_PER_POST = 1;
export const MAX_FRAME_SIZE_PER_POST = 1;

export const MAX_POST_SIZE_PER_THREAD = env.shared.NODE_ENV === NODE_ENV.Development ? 10 : 25;
export const MIN_POST_SIZE_PER_THREAD = 3;

// HTTP Cache headers
// Cache for 1 minute, stale for 30 days
export const SWR_CACHE_AGE_1_MIN_30_DAYS = 'public, s-maxage=1, stale-while-revalidate=2592000';
// Cache for 10 minutes, stale for 30 days
export const SWR_CACHE_AGE_10_MINS_30_DAYS = 'public, s-maxage=600, stale-while-revalidate=2592000';
// Cache for 30 days
export const CACHE_AGE_30_DAYS = 'public, s-maxage=2592000';
// Cache indefinitely
export const CACHE_AGE_INDEFINITE = 'public, max-age=31536000, immutable';
// Cache indefinitely on Disk
export const CACHE_AGE_INDEFINITE_ON_DISK = 'public, s-maxage=31536000, max-age=31536000, must-revalidate';

// Contracts
export const DEFAULT_TOKEN_ADDRESS = '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270';
export const LENS_HUB_PROXY_ADDRESS = '0xDb46d1Dc155634FbC732f92E853b10B288AD5a1d';
export const PUBLIC_ACT_PROXY_ADDRESS = '0x53582b1b7BE71622E7386D736b6baf87749B7a2B';
export const TOKEN_HANDLE_REGISTRY = '0xD4F2F33680FCCb36748FA9831851643781608844';

export const ALLOWED_IMAGES_MIMES = ['image/png', 'image/jpeg', 'image/gif', 'image/webp', 'image/bmp'] as const;

export const SUFFIX_NAMES: Record<(typeof ALLOWED_IMAGES_MIMES)[number], string> = {
    'image/png': 'png',
    'image/jpeg': 'jpg',
    'image/gif': 'gif',
    'image/bmp': 'bmp',
    'image/webp': 'webp',
};

export const FILE_MAX_SIZE_IN_BYTES = 4 * 1024 * 1024; // 4MB

export const TWITTER_TIMELINE_OPTIONS: TweetV2UserTimelineParams = {
    expansions: [
        'attachments.media_keys',
        'attachments.poll_ids',
        'author_id',
        'referenced_tweets.id',
        'referenced_tweets.id.author_id',
    ],
    'media.fields': ['media_key', 'height', 'width', 'type', 'url', 'preview_image_url', 'variants'],
    'tweet.fields': ['text', 'attachments', 'author_id', 'created_at', 'lang', 'public_metrics', 'referenced_tweets'],
    'user.fields': ['profile_image_url', 'name', 'username'],
};
