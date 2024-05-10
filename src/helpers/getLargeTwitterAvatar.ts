import { TWITTER_NORML_AVATAR } from '@/constants/regexp.js';

export function getLargeTwitterAvatar(url: string) {
    if (!TWITTER_NORML_AVATAR.test(url)) return url;
    return url.replace(/_normal(\.\w+)$/, '_400x400$1');
}
