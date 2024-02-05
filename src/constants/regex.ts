export const URL_REGEX =
    /(https:\/\/|http:\/\/)?(www\.)?[-a-zA-Z0-9]{1,256}\.[a-zA-Z]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/gu;
export const MENTION_REGEX = /@[^\s]+/g;

export const HASHTAG_REGEX = /(#\w*[A-Za-z]\w*)/g;

export const MIRROR_HOSTNAME_REGEXP = /mirror\.xyz|.+\.mirror\.xyz/i;

export const WARPCAST_THREAD_REGEX = /^https:\/\/warpcast\.com\/([^/]+)\/([^/]+)$/;

export const WARPCAST_CONVERSATIONS_REGEX = /^https:\/\/warpcast\.com\/~\/conversations\/0x[a-fA-F0-9]+$/;

export const LENS_DETAIL_REGEX = /^https:\/\/hey\.xyz\/posts\/.*$/;

export const MASK_SOCIAL_DETAIL_REGEX = /^https:\/\/mask\.social\/post\/(\w+)\/([\w-]+)$/;
