import urlcat from 'urlcat';

import { PageRoute, type SocialSource } from '@/constants/enum.js';
import { resolveSourceInUrl } from '@/helpers/resolveSourceInUrl.js';

export function resolvePostUrl(source: SocialSource, id: string) {
    return urlcat(PageRoute.PostDetail, { source: resolveSourceInUrl(source), id });
}
