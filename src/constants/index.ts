/* cspell:disable */

import type { TweetV2UserTimelineParams, UsersV2Params } from 'twitter-api-v2';

import {
    EngagementType,
    FileMimeType,
    NetworkType,
    NODE_ENV,
    ProfileTabType,
    SearchType,
    type SocialSource,
    Source,
    VERCEL_NEV,
} from '@/constants/enum.js';
import { env } from '@/constants/env.js';
import type { Attachment } from '@/providers/types/SocialMedia.js';
import { MediaSource } from '@/types/compose.js';

export const EMPTY_LIST = Object.freeze([]) as never[];
export const EMPTY_OBJECT = Object.freeze({}) as Record<string, never>;

export const SITE_NAME = 'Firefly ✨ Everything App for Web3 Natives';
export const SITE_DESCRIPTION = "Firefly is a social app for exploring what's happening onchain.";
export const SITE_URL = env.external.NEXT_PUBLIC_SITE_URL;
export const SITE_HOSTNAME = 'firefly.mask.social';

export const FARCASTER_REPLY_URL = 'https://relay.farcaster.xyz';
export const WARPCAST_ROOT_URL = 'https://api.warpcast.com/v2';
export const WARPCAST_CLIENT_URL = 'https://client.warpcast.com/v2';
export const FIREFLY_ROOT_URL = env.external.NEXT_PUBLIC_FIREFLY_API_URL;
export const FIREFLY_DEV_ROOT_URL = 'https://api-dev.firefly.land';
export const FIREFLY_STAMP_URL = 'https://stamp.firefly.land/avatar';
export const HEY_IPFS_GW_URL = 'https://gw.ipfs-lens.dev/ipfs';
export const DSEARCH_BASE_URL = 'https://dsearch.mask.r2d2.to';
export const CORS_HOST = 'https://cors-next.r2d2.to';
export const COINGECKO_URL_BASE = 'https://coingecko-agent.r2d2.to/api/v3';
export const GO_PLUS_LABS_ROOT_URL = 'https://gopluslabs.r2d2.to';
export const ADVERTISEMENT_JSON_URL = 'https://media.firefly.land/advertisement/web.json';
export const TWITTER_UPLOAD_MEDIA_URL = 'https://upload.twitter.com/1.1/media/upload.json';

export const FARCASTER_REPLY_COUNTDOWN = 50; // in seconds
export const FIREFLY_SCAN_QR_CODE_COUNTDOWN = 5 * 60; // in seconds

export const HUBBLE_URL = env.internal.HUBBLE_URL ?? env.external.NEXT_PUBLIC_HUBBLE_URL;

export const NEYNAR_URL = 'https://api.neynar.com';
export const RP_HASH_TAG = '#FireflyLuckyDrop';

export const HIDDEN_SECRET = '[HIDE_FROM_CLIENT]';
export const NOT_DEPEND_HUBBLE_KEY = '[TO_BE_REPLACED_LATER]';

export const SORTED_PROFILE_TAB_TYPE: Record<SocialSource, ProfileTabType[]> = {
    [Source.Lens]: [ProfileTabType.Feed, ProfileTabType.Replies, ProfileTabType.Media, ProfileTabType.Collected],
    [Source.Farcaster]: [ProfileTabType.Feed, ProfileTabType.Replies, ProfileTabType.Liked, ProfileTabType.Channels],
    [Source.Twitter]: [ProfileTabType.Feed, ProfileTabType.Replies],
};
export const SORTED_ENGAGEMENT_TAB_TYPE: Record<SocialSource, EngagementType[]> = {
    [Source.Lens]: [EngagementType.Likes, EngagementType.Quotes, EngagementType.Mirrors],
    // TODO No API to fetch recasts for now.
    [Source.Farcaster]: [EngagementType.Likes, EngagementType.Quotes, EngagementType.Recasts],
    [Source.Twitter]: [EngagementType.Likes, EngagementType.Quotes],
};
export const SORTED_SEARCH_TYPE: Record<SocialSource, SearchType[]> = {
    [Source.Lens]: [SearchType.Posts, SearchType.Profiles],
    [Source.Farcaster]: [SearchType.Posts, SearchType.Profiles, SearchType.Channels],
    [Source.Twitter]: [SearchType.Posts, SearchType.Profiles],
};
export const SORTED_HOME_SOURCES = [Source.Farcaster, Source.Lens, Source.NFTs, Source.Article] as const;
export const SORTED_PROFILE_SOURCES = [Source.Farcaster, Source.Lens, Source.Twitter, Source.Wallet];
export const SORTED_SOCIAL_SOURCES = [Source.Farcaster, Source.Lens, Source.Twitter] as const;
export const SORTED_BOOKMARK_SOURCES =
    env.shared.NODE_ENV === NODE_ENV.Development
        ? [Source.Farcaster, Source.Lens, Source.Twitter, Source.Article]
        : [Source.Farcaster, Source.Lens, Source.Article];
export const SORTED_CHANNEL_SOURCES: SocialSource[] = [Source.Farcaster];
export const SORTED_POLL_SOURCES: SocialSource[] = [Source.Twitter, Source.Farcaster, Source.Lens];
export const SORTED_MEDIA_SOURCES: MediaSource[] = [
    MediaSource.Twimg,
    MediaSource.S3,
    MediaSource.IPFS,
    MediaSource.Imgur,
    MediaSource.Giphy,
    MediaSource.Local,
];
export const SUPPORTED_FRAME_SOURCES: SocialSource[] = [Source.Farcaster, Source.Lens];
export const SUPPORTED_PREVIEW_MEDIA_TYPES: Array<Attachment['type']> = ['Image', 'AnimatedGif'];
export const SUPPORTED_VIDEO_SOURCES: SocialSource[] = [Source.Farcaster, Source.Lens, Source.Twitter];

export const TIPS_SUPPORT_NETWORKS = [NetworkType.Ethereum, NetworkType.Solana];

// Lens
export const IPFS_GATEWAY = 'https://ipfs.io/ipfs/';
export const ARWEAVE_GATEWAY = 'https://arweave.net/';
export const LENS_MEDIA_SNAPSHOT_URL = 'https://ik.imagekit.io/lens/media-snapshot';
export const HEY_URL = 'https://hey.xyz';
export const HEY_API_URL = 'https://api.hey.xyz';
export const HEY_IMAGEKIT_URL = 'https://ik.imagekit.io/lensterimg';

// Named transforms for ImageKit
export const AVATAR = 'tr:w-300,h-300';
export const COVER = 'tr:w-1500,h-500';
export const ATTACHMENT = 'tr:w-1000';

export const IS_PRODUCTION = env.external.NEXT_PUBLIC_VERCEL_ENV === VERCEL_NEV.Production;
export const IS_DEVELOPMENT = env.external.NEXT_PUBLIC_VERCEL_ENV === VERCEL_NEV.Development;
export const IS_PREVIEW = env.external.NEXT_PUBLIC_VERCEL_ENV === VERCEL_NEV.Preview;

export const EVER_API = 'https://endpoint.4everland.co';

export const FRAME_SERVER_URL = 'https://polls.mask.social';
export const FRAME_DEV_SERVER_URL = 'https://fc-polls-ruddy.vercel.app';

// S3 bucket
export const S3_BUCKET = {
    HEY_MEDIA: 'hey-media',
    FIREFLY_LENS_MEDIA: 'firefly-lens-media',
};

export const MAX_CHAR_SIZE_PER_POST: Record<SocialSource, number> = {
    [Source.Farcaster]: 1024,
    [Source.Lens]: 5000,
    [Source.Twitter]: 280,
};
export const MAX_CHAR_SIZE_VERIFY_PER_POST: Record<SocialSource, number> = {
    [Source.Farcaster]: 1024,
    [Source.Lens]: 5000,
    [Source.Twitter]: 5000,
};
export const MAX_IMAGE_SIZE_PER_POST: Record<SocialSource, number> = {
    [Source.Farcaster]: 2,
    [Source.Lens]: 20,
    [Source.Twitter]: 4,
};
export const MAX_VIDEO_SIZE_PER_POST: Record<SocialSource, number> = {
    [Source.Farcaster]: 400 * 1024 * 1024, // 400MB
    [Source.Lens]: 400 * 1024 * 1024, // 400MB
    [Source.Twitter]: 75 * 1024 * 1024, // 75MB
};

// HTTP Cache headers
export const CACHE_AGE_INDEFINITE_ON_DISK = 'public, s-maxage=31536000, max-age=31536000, must-revalidate';

export const MAX_FILE_SIZE_PER_IMAGE: Record<SocialSource, number> = {
    [Source.Twitter]: 5 * 1024 * 1024, // 5MB
    [Source.Lens]: 100 * 1024 * 1024, // 100MB
    [Source.Farcaster]: 100 * 1024 * 1024, // 100MB
};

export const MAX_FILE_SIZE_PER_GIF: Record<SocialSource, number> = {
    [Source.Twitter]: 15 * 1024 * 1024, // 15MB
    [Source.Lens]: 15 * 1024 * 1024, // 15MB
    [Source.Farcaster]: 15 * 1024 * 1024, // 15MB
};

// https://mask.atlassian.net/browse/FW-2212
// TODO: Our upload is not strong enough to handle 1GB videos. So we limit 400MB here.
export const MAX_FILE_SIZE_PER_VIDEO: Record<SocialSource, number> = {
    [Source.Twitter]: 400 * 1024 * 1024, // 400MB
    [Source.Lens]: 400 * 1024 * 1024, // 400MB
    [Source.Farcaster]: 400 * 1024 * 1024, // 400MB
};

// Search Bar
export const MAX_SEARCH_RECORD_SIZE = 5;
export const MAX_RECOMMEND_PROFILE_SIZE = 10;

// POST
export const MAX_FRAME_SIZE_PER_POST = 1;

export const MAX_POST_SIZE_PER_THREAD = env.shared.NODE_ENV === NODE_ENV.Development ? 10 : 25;
export const MIN_POST_SIZE_PER_THREAD = 3;

// Contracts
export const LENS_HUB_PROXY_ADDRESS = '0xDb46d1Dc155634FbC732f92E853b10B288AD5a1d';
export const POAP_CONTRACT_ADDRESS = '0x22C1f6050E56d2876009903609a2cC3fEf83B415';

export const ALLOWED_IMAGES_MIMES = [
    FileMimeType.PNG,
    FileMimeType.JPEG,
    FileMimeType.GIF,
    FileMimeType.WEBP,
    FileMimeType.BMP,
] as const;

export const ALLOWED_VIDEO_MIMES = [
    FileMimeType.MP4,
    FileMimeType.MPEG,
    FileMimeType.MS_VIDEO,
    FileMimeType.OGG,
    FileMimeType.WEBM,
    FileMimeType.GPP,
    FileMimeType.GPP2,
];

export const ALLOWED_MEDIA_MIMES = [...ALLOWED_IMAGES_MIMES, ...ALLOWED_VIDEO_MIMES] as const;

export const SUFFIX_NAMES: Record<FileMimeType, string> = {
    [FileMimeType.PNG]: 'png',
    [FileMimeType.JPEG]: 'jpg',
    [FileMimeType.GIF]: 'gif',
    [FileMimeType.BMP]: 'bmp',
    [FileMimeType.WEBP]: 'webp',
    [FileMimeType.MP4]: 'mp4',
    [FileMimeType.MPEG]: 'mpeg',
    [FileMimeType.MS_VIDEO]: 'avi',
    [FileMimeType.OGG]: 'ogv',
    [FileMimeType.GPP]: '3gp',
    [FileMimeType.GPP2]: '3g2',
    [FileMimeType.WEBM]: 'webm',
    [FileMimeType.MOV]: 'mov',
};

export const TWITTER_TIMELINE_OPTIONS: TweetV2UserTimelineParams = {
    expansions: [
        'attachments.media_keys',
        'attachments.poll_ids',
        'author_id',
        'referenced_tweets.id',
        'referenced_tweets.id.author_id',
        'entities.mentions.username',
        'in_reply_to_user_id',
    ],
    'media.fields': ['media_key', 'height', 'width', 'type', 'url', 'preview_image_url', 'variants'],
    'tweet.fields': [
        'text',
        'note_tweet',
        'attachments',
        'author_id',
        'created_at',
        'lang',
        'public_metrics',
        'referenced_tweets',
    ],
    'user.fields': ['description', 'username', 'name', 'profile_image_url', 'public_metrics', 'connection_status'],
    'poll.fields': ['duration_minutes', 'end_datetime', 'id', 'options', 'voting_status'],
};

export const TWITTER_USER_OPTIONS: Partial<UsersV2Params> = {
    'user.fields': [
        'description',
        'username',
        'name',
        'profile_image_url',
        'public_metrics',
        'connection_status',
        'url',
        'location',
        'verified',
        'verified_type',
    ],
};

export const SOLANA_WALLET_CACHE_KEY = 'walletName';

// update profile
export const MAX_PROFILE_BIO_SIZE: Record<SocialSource, number> = {
    [Source.Farcaster]: 160,
    [Source.Lens]: 260,
    [Source.Twitter]: 160,
};

export const MAX_PROFILE_DISPLAY_NAME_SIZE: Record<SocialSource, number> = {
    [Source.Farcaster]: 32,
    [Source.Lens]: 100,
    [Source.Twitter]: 50,
};

export const MAX_PROFILE_LOCATION_SIZE: Record<SocialSource, number> = {
    [Source.Farcaster]: 0,
    [Source.Lens]: 100,
    [Source.Twitter]: 30,
};

export const MAX_PROFILE_WEBSITE_SIZE: Record<SocialSource, number> = {
    [Source.Farcaster]: 0,
    [Source.Lens]: 100,
    [Source.Twitter]: 100,
};

// https://support.mirror.xyz/hc/en-us/articles/13729399363220-Platform-fees
// 0.00069 ETH
export const MIRROR_COLLECT_FEE = 690000000000000n;
// 1 matic
export const MIRROR_COLLECT_FEE_IN_POLYGON = 1000000000000000000n;

// https://docs.paragraph.xyz/docs/advanced/referral-program
// 0.000777 ETH
export const PARAGRAPH_COLLECT_FEE = 777000000000000n;
// 2 matic
export const PARAGRAPH_COLLECT_FEE_IN_POLYGON = 2000000000000000000n;

export const THIRTY_DAYS = 1000 * 60 * 60 * 24 * 30;

export const MAX_SIZE_PER_CHUNK = 4 * 1024 * 1024; // 4MB
