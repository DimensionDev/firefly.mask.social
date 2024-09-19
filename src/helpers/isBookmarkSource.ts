import type { BookmarkSource } from '@/constants/enum.js';
import { BOOKMARK_SOURCES } from '@/constants/index.js';

export function isBookmarkSource(source: string): source is BookmarkSource {
    return BOOKMARK_SOURCES.includes(source as BookmarkSource);
}
