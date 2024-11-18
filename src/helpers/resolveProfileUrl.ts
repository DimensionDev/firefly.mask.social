import urlcat from 'urlcat';

import { NetworkType, type ProfileCategory, type ProfilePageSource, Source } from '@/constants/enum.js';
import { SORTED_PROFILE_TAB_TYPE, WALLET_PROFILE_TAB_TYPES } from '@/constants/index.js';
import { getAddressType } from '@/helpers/getAddressType.js';
import { resolveSourceInUrl } from '@/helpers/resolveSourceInUrl.js';

function getDefaultProfileCategory(source: ProfilePageSource, handle?: string) {
    if (source === Source.Wallet) {
        return getAddressType(handle || '') === NetworkType.Solana
            ? WALLET_PROFILE_TAB_TYPES.solana[0]
            : WALLET_PROFILE_TAB_TYPES.ethereum[0];
    }
    return SORTED_PROFILE_TAB_TYPE[source][0];
}

function resolveProfileCategory(source: ProfilePageSource, handle?: string, category?: ProfileCategory) {
    if (!category) {
        return getDefaultProfileCategory(source, handle);
    }

    const supportedCategories: string[] =
        source === Source.Wallet
            ? getAddressType(handle || '') === NetworkType.Solana
                ? WALLET_PROFILE_TAB_TYPES.solana
                : WALLET_PROFILE_TAB_TYPES.ethereum
            : SORTED_PROFILE_TAB_TYPE[source];
    return supportedCategories.includes(category) ? category : getDefaultProfileCategory(source, handle);
}

export function resolveProfileUrl(source: ProfilePageSource, handle?: string, category?: ProfileCategory) {
    if (!handle && !category) {
        return urlcat(`/profile/:source`, {
            source: resolveSourceInUrl(source),
        });
    }

    return urlcat(`/profile/:source/:handle/:category`, {
        handle,
        source: resolveSourceInUrl(source),
        category: resolveProfileCategory(source, handle, category),
    });
}
