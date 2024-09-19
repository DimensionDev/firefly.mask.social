import urlcat from 'urlcat';

import { type ProfileCategory, type ProfilePageSource, Source } from '@/constants/enum.js';
import { SORTED_PROFILE_TAB_TYPE, WALLET_PROFILE_TAB_TYPES } from '@/constants/index.js';
import { resolveSourceInUrl } from '@/helpers/resolveSourceInUrl.js';

export function resolveProfileUrl(source: ProfilePageSource, handle?: string, category?: ProfileCategory) {
    if (!handle && !category) {
        return urlcat(`/profile/:source`, {
            source: resolveSourceInUrl(source),
        });
    }
    return urlcat(`/profile/:source/:handle/:category`, {
        handle,
        source: resolveSourceInUrl(source),
        category:
            category ?? (source === Source.Wallet ? WALLET_PROFILE_TAB_TYPES[0] : SORTED_PROFILE_TAB_TYPE[source][0]),
    });
}
