import urlcat from 'urlcat';

import type { SocialSource } from '@/constants/enum.js';
import { resolveSourceInURL } from '@/helpers/resolveSourceInURL.js';

export function resolvePostUrl(source: SocialSource, id: string) {
    return urlcat(`/post/:source/:id`, { source: resolveSourceInURL(source), id });
}
