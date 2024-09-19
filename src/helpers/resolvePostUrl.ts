import urlcat from 'urlcat';

import { PageRoute, type SocialSource } from '@/constants/enum.js';
import { resolveSourceInURL } from '@/helpers/resolveSourceInURL.js';

export function resolvePostUrl(source: SocialSource, id: string) {
    return urlcat(PageRoute.PostDetail, { source: resolveSourceInURL(source), id });
}
