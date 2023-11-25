export const WARPCAST_ROOT_URL = 'https://api.warpcast.com/v2';
export const FIREFLY_ROOT_URL = process.env.NEXT_PUBLIC_FIREFLY_API_URL;
export const FIREFLY_HUBBLE_URL = process.env.NEXT_PUBLIC_FIREFLY_HUBBLE_URL;

export const EMPTY_LIST = Object.freeze([]) as never[];
export const EMPTY_OBJECT = Object.freeze({}) as Record<string, never>;

export const EIP_712_FARCASTER_DOMAIN = {
    name: 'Farcaster Verify Ethereum Address',
    version: '2.0.0',
    salt: '0xf2d857f4a3edcb9b78b4d503bfe733db1e3f6cdc2b7971ee739626c97e86a558' as `0x${string}`,
};

// Lens
export const IPFS_GATEWAY = 'https://gw.ipfs-lens.dev/ipfs/';
export const ARWEAVE_GATEWAY = 'https://arweave.net/';
export const LENS_MEDIA_SNAPSHOT_URL = 'https://ik.imagekit.io/lens/media-snapshot';
export const METADATA_WORKER_URL = 'https://metadata.hey.xyz';

// Named transforms for ImageKit
export const AVATAR = 'tr:w-300,h-300';
export const EXPANDED_AVATAR = 'tr:w-1000,h-1000';
export const COVER = 'tr:w-1500,h-500';
export const ATTACHMENT = 'tr:w-1000';

export const LS_LOCALE_KEY = 'social.mask.locale';

export const IS_PRODUCTION = process.env.NODE_ENV === 'production';
export const IS_DEVELOPMENT = process.env.NODE_ENV === 'development';
export const IS_PREVIEW = process.env.NEXT_PUBLIC_VERCEL_ENV === 'preview';
