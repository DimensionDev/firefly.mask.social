import urlcat from 'urlcat';

import type { BookmarkSource } from '@/constants/enum.js';
import { resolveSourceInUrl } from '@/helpers/resolveSourceInUrl.js';

export function resolveBookmarkUrl(source: BookmarkSource) {
    return urlcat('/bookmarks/:source', { source: resolveSourceInUrl(source) });
}
