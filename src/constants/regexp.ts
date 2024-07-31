export const URL_REGEX =
    /((https?:\/\/)?[a-zA-Z0-9]+([-.]{1}[a-zA-Z0-9]+)*\.[a-zA-Z]{2,}(:[0-9]{1,5})?(\/[^ \n,)>]*)?)/gi;

export const EMAIL_REGEX =
    /(([^\s"(),.:;<>@[\\\]]+(\.[^\s"(),.:;<>@[\\\]]+)*)|(".+"))@((\[(?:\d{1,3}\.){3}\d{1,3}])|(([\dA-Za-z-]+\.)+[A-Za-z]{2,}))/;

export const MENTION_REGEX = /@[^\s()@:%+~#?&=,!?']+/g;

export const HASHTAG_REGEX = /(^|\s)(#[^0-9][^\s#]+)/g;

/** Financial symbol */
export const SYMBOL_REGEX = /(^|\s)(\$([a-zA-Z0-9]|\p{Script=Han})+)/gu;

// for safari does not support negative lookbehind
// since we cannot eliminate the space before the channel, we will trim it later
export const CHANNEL_REGEX = /(^|\s)\/[a-z0-9][a-z0-9-]*($|(?![0-9a-zA-Z/]))/g;

export const MIRROR_HOSTNAME_REGEXP = /mirror\.xyz|.+\.mirror\.xyz/i;

export const WARPCAST_THREAD_REGEX = /^https:\/\/warpcast\.com\/([^/]+)\/([^/]+)$/;

export const WARPCAST_CONVERSATIONS_REGEX = /^https:\/\/warpcast\.com\/~\/conversations\/0x[a-fA-F0-9]+$/;

export const LENS_DETAIL_REGEX = /^https:\/\/hey\.xyz\/posts\/.*$/;

export const MASK_SOCIAL_DETAIL_REGEX =
    /((https:\/\/|http:\/\/)?(?:firefly\.|firefly-staging\.|firefly-canary\.)?mask\.social|\.vercel\.app)\/post\/([\w-]+)(\?.*)?$/i;

export const OLD_MASK_SOCIAL_POST_PATH_REGEX = /\/post\/(lens|farcaster)\/([\w-]+)/i;

export const OLD_MASK_SOCIAL_PROFILE_PATH_REGEX = /\/profile\/(\w+)\/([\w-]+)/i;

export const MASK_SOCIAL_POST_PATH_REGEX = /\/post\/([\w-]+)/i;

export const BIO_TWITTER_PROFILE_REGEX = /([^\s]+)\.twitter/;
/* cspell:disable */
export const TWITTER_NORMAL_AVATAR = /^https:\/\/pbs\.twimg\.com.*_normal(\.\w+)$/;

export const NUMBER_BIGGER_THAN_ZERO = /^[1-9]\d*$/;

export const NUMBER_STRING_REGEX = /^[0-9\s+-,]+$/m;

export const TWEET_REGEX = /https:\/\/(x\.com|twitter\.com)\/([a-zA-Z_][a-zA-Z0-9_]*)\/status\/(\d+)/;

export const TWEET_WEB_REGEX = /https:\/\/(x\.com|twitter\.com)\/i\/web\/status\/(\d+)/;

export const URI_COMPONENT_REGEXP = /([A-Za-z0-9\-_.!~*'()]|%[0-9A-Fa-f]{2})+/gi;
