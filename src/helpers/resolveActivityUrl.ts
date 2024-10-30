import urlcat from 'urlcat';

import type { SourceInURL } from '@/constants/enum.js';

export function resolveActivityUrl(
    name: string,
    options?: {
        platform?: SourceInURL;
        referralCode?: string;
    },
) {
    return urlcat('/event/:name', {
        name,
        p: options?.platform,
        r: options?.referralCode,
    });
}
