/* cspell:disable */

import { ProfileTabType, SearchType, SocialPlatform } from '@/constants/enum.js';
import { RestrictionType } from '@/types/compose.js';

export const SITE_NAME = 'Firefly: Web3 & NFT Explorer';
export const SITE_DESCRIPTION =
    "Firefly is a social app for exploring what's happening in the world of Web3, NFTs, AI, and more.";
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://firefly.mask.social';
export const SITE_HOSTNAME = 'firefly.mask.social';

export const WARPCAST_ROOT_URL = 'https://api.warpcast.com/v2';
export const WARPCAST_CLIENT_URL = 'https://client.warpcast.com/v2';
export const FIREFLY_ROOT_URL = process.env.NEXT_PUBLIC_FIREFLY_API_URL ?? 'https://api.firefly.land';
export const FIREFLY_STAMP_URL = 'https://stamp.firefly.land/avatar';

export const HUBBLE_URL = process.env.NEXT_PUBLIC_HUBBLE_URL;

export const NEYNAR_URL = 'https://api.neynar.com';
export const RP_HASH_TAG = '#FireflyLuckyDrop';

export const EMPTY_LIST = Object.freeze([]) as never[];
export const EMPTY_OBJECT = Object.freeze({}) as Record<string, never>;

export const EIP_712_FARCASTER_DOMAIN = {
    name: 'Farcaster Verify Ethereum Address',
    version: '2.0.0',
    salt: '0xf2d857f4a3edcb9b78b4d503bfe733db1e3f6cdc2b7971ee739626c97e86a558' as `0x${string}`,
};

export const SORTED_PROFILE_TAB_TYPE = [ProfileTabType.Feed, ProfileTabType.Collected]; // ProfileTabType.Channels
export const SORTED_SEARCH_TYPE = [SearchType.Posts, SearchType.Users];
export const SORTED_SOURCES = [SocialPlatform.Farcaster, SocialPlatform.Lens, SocialPlatform.Twitter]; 
export const SORTED_RESTECTION_TYPE = [RestrictionType.Everyone, RestrictionType.OnlyPeopleYouFollow];

// Lens
export const IPFS_GATEWAY = 'https://gw.ipfs-lens.dev/ipfs/';
export const ARWEAVE_GATEWAY = 'https://arweave.net/';
export const LENS_MEDIA_SNAPSHOT_URL = 'https://ik.imagekit.io/lens/media-snapshot';
export const HEY_URL = 'https://hey.xyz';
export const HEY_API_URL = 'https://api.hey.xyz';

// Named transforms for ImageKit
export const AVATAR = 'tr:w-300,h-300';
export const EXPANDED_AVATAR = 'tr:w-1000,h-1000';
export const COVER = 'tr:w-1500,h-500';
export const ATTACHMENT = 'tr:w-1000';

export const IS_PRODUCTION = process.env.NEXT_PUBLIC_VERCEL_ENV === 'production';
export const IS_DEVELOPMENT = process.env.NEXT_PUBLIC_VERCEL_ENV === 'development';
export const IS_PREVIEW = process.env.NEXT_PUBLIC_VERCEL_ENV === 'preview';

export const EVER_API = 'https://endpoint.4everland.co';

// S3 bucket
export const S3_BUCKET = {
    HEY_MEDIA: 'hey-media',
    FIREFLY_LENS_MEDIA: 'firefly-lens-media',
};

export const MAX_CHAR_SIZE_PER_POST: Record<SocialPlatform, number> = {
    [SocialPlatform.Lens]: 5000,
    [SocialPlatform.Farcaster]: 320,
    [SocialPlatform.Twitter]: 280,
};
export const DANGER_CHAR_LIMIT: Record<SocialPlatform, number> = {
    [SocialPlatform.Lens]: Math.floor(MAX_CHAR_SIZE_PER_POST[SocialPlatform.Lens] * 0.9),
    [SocialPlatform.Farcaster]: Math.floor(MAX_CHAR_SIZE_PER_POST[SocialPlatform.Farcaster] * 0.9),
    [SocialPlatform.Twitter]: Math.floor(MAX_CHAR_SIZE_PER_POST[SocialPlatform.Twitter] * 0.9),
};
export const SAFE_CHAR_LIMIT: Record<SocialPlatform, number> = {
    [SocialPlatform.Lens]: Math.floor(MAX_CHAR_SIZE_PER_POST[SocialPlatform.Lens] * 0.8),
    [SocialPlatform.Farcaster]: Math.floor(MAX_CHAR_SIZE_PER_POST[SocialPlatform.Farcaster] * 0.8),
    [SocialPlatform.Twitter]: Math.floor(MAX_CHAR_SIZE_PER_POST[SocialPlatform.Twitter] * 0.8),
};

// Search Bar
export const MAX_SEARCH_RECORD_SIZE = 5;
export const MAX_RECOMMEND_PROFILE_SIZE = 10;

// POST
export const MAX_OG_SIZE_PER_POST = 1;
export const MAX_FRAME_SIZE_PER_POST = 1;

export const MAX_POST_SIZE_PER_THREAD = process.env.NODE_ENV === 'development' ? 5 : 25;
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
