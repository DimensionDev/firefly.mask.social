import urlcat from 'urlcat';

import { type ProfileCategory, type ProfilePageSource, Source } from '@/constants/enum.js';
import { SORTED_PROFILE_TAB_TYPE, WALLET_PROFILE_TAB_TYPES } from '@/constants/index.js';
import { resolveSourceInURL } from '@/helpers/resolveSourceInURL.js';

export function resolveProfileUrl(source: ProfilePageSource, handle?: string, category?: ProfileCategory) {
    if (!handle && !category) {
        return urlcat(`/profile/:source`, {
            source: resolveSourceInURL(source),
        });
    }
    return urlcat(`/profile/:source/:handle/:category`, {
        handle,
        source: resolveSourceInURL(source),
        category:
            category ?? (source === Source.Wallet ? WALLET_PROFILE_TAB_TYPES[0] : SORTED_PROFILE_TAB_TYPE[source][0]),
    });
}
