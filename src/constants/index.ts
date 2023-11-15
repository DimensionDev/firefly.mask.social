export const WARPCAST_ROOT_URL = 'https://api.warpcast.com/v2';
export const FIREFLY_ROOT_URL = process.env.FIREFLY_API_URL;
export const FIREFLY_HUBBLE_URL = process.env.FIREFLY_HUBBLE_URL;

export const EMPTY_LIST = Object.freeze([]) as never[];
export const EMPTY_OBJECT = Object.freeze({}) as Record<string, never>;

export const EIP_712_FARCASTER_DOMAIN = {
    name: 'Farcaster Verify Ethereum Address',
    version: '2.0.0',
    salt: '0xf2d857f4a3edcb9b78b4d503bfe733db1e3f6cdc2b7971ee739626c97e86a558' as `0x${string}`,
};
