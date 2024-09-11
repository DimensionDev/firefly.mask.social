import urlcat from 'urlcat';

import { type ProfileCategory, type SocialSource, Source } from '@/constants/enum.js';
import { SORTED_PROFILE_TAB_TYPE, WALLET_PROFILE_TAB_TYPES } from '@/constants/index.js';
import { resolveSourceInURL } from '@/helpers/resolveSourceInURL.js';

export function resolveProfileUrl(source: SocialSource | Source.Wallet, handle: string, category?: ProfileCategory) {
    return urlcat(`/profile/${handle}/:category`, {
        source: resolveSourceInURL(source),
        category:
            category ?? (source === Source.Wallet ? WALLET_PROFILE_TAB_TYPES[0] : SORTED_PROFILE_TAB_TYPE[source][0]),
    });
}
