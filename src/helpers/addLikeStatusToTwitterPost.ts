import { produce } from 'immer';

import type { Post } from '@/providers/types/SocialMedia.js';
import { useTwitterLikeStore } from '@/store/useTwitterLikeStore.js';

export function addLikeStatusToTweet(profileId: string, post: Post): Post {
    return produce(post, (draft) => {
        draft.hasLiked = useTwitterLikeStore.getState().isLiked(profileId, post.postId);
        for (const x of ['commentOn', 'root', 'quoteOn', 'mirrorOn'] as const) {
            if (x in draft && draft[x]) {
                draft[x] = addLikeStatusToTweet(profileId, draft[x]);
            }
        }
        return draft;
    });
}
