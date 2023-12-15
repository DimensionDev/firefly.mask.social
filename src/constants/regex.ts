export const URL_REGEX =
    /\b(http|https):\/\/([\p{L}\p{N}_-]+(?:(?:\.[\p{L}\p{N}_-]+)+))([\p{L}\p{N}_.,@?^=%&:/~+#-]*[\p{L}\p{N}_@?^=%&/~+#-])/gu;

export const MENTION_REGEX = /@[^\s]+/g;

export const HASHTAG_REGEX = /(#\w*[A-Za-z]\w*)/g;

export const MIRROR_HOSTNAME_REGEXP = /mirror\.xyz|.+\.mirror\.xyz/i;

export const WARPCAST_THREAD_REGEX = /^https:\/\/warpcast\.com\/([^/]+)\/([^/]+)$/;

export const WARPCAST_CONVERSATIONS_REGEX = /^https:\/\/warpcast\.com\/~\/conversations\/0x[a-fA-F0-9]+$/;
