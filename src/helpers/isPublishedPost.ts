import { SORTED_SOURCES } from '@/constants/index.js';
import type { CompositePost } from '@/store/useComposeStore.js';
import type { ComposeType } from '@/types/compose.js';

export function isPublishedPost(type: ComposeType, compositePost: CompositePost) {
    return SORTED_SOURCES.every((x) => compositePost.availableSources.includes(x) && compositePost.postId[x]);
}
