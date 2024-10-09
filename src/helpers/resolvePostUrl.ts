import urlcat from 'urlcat';

import { type SocialSource } from '@/constants/enum.js';
import { resolveSourceInUrl } from '@/helpers/resolveSourceInUrl.js';

export function resolvePostUrl(source: SocialSource, id: string) {
    return urlcat('/post/:source/:id', { source: resolveSourceInUrl(source), id });
}
