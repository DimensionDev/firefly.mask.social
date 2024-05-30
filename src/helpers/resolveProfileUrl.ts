import urlcat from 'urlcat';

import type { Source } from '@/constants/enum.js';
import { resolveSourceInURL } from '@/helpers/resolveSourceInURL.js';

export function resolveProfileUrl(source: Source, handle: string) {
    return urlcat(`/profile/${handle}`, {
        source: resolveSourceInURL(source),
    });
}
