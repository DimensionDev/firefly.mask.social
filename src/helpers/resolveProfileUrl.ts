import urlcat from 'urlcat';

import type { SocialSource, Source } from '@/constants/enum.js';
import { resolveSourceInURL } from '@/helpers/resolveSourceInURL.js';

export function resolveProfileUrl(source: SocialSource | Source.Wallet, handle: string) {
    return urlcat(`/profile/${handle}`, {
        source: resolveSourceInURL(source),
    });
}
