import urlcat from 'urlcat';

import type { BookmarkSource } from '@/constants/enum.js';
import { resolveSourceInURL } from '@/helpers/resolveSourceInURL.js';

export function resolveBookmarkUrl(source: BookmarkSource) {
    return urlcat('/bookmarks/:source', { source: resolveSourceInURL(source) });
}
