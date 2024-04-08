import type { QueryClient } from '@tanstack/react-query';
import { type Draft, produce } from 'immer';

import type { SocialPlatform } from '@/constants/enum.js';
import type { Post } from '@/providers/types/SocialMedia.js';

type Patcher = (old: Draft<Post>) => void;
export function patchPostQueryData(queryClient: QueryClient, source: SocialPlatform, postId: string, patcher: Patcher) {
    queryClient.setQueryData<Post>([source, 'post-detail', postId], (old) => {
        if (!old) return old;
        return produce(old, patcher);
    });

    queryClient.setQueriesData<{ pages: Array<{ data: Post[] }> }>({ queryKey: ['posts', source] }, (old) => {
        if (!old?.pages) return old;

        return produce(old, (draft) => {
            for (const page of draft.pages) {
                for (const post of page.data) {
                    for (const p of [post, post.commentOn, post.root, post.quoteOn, ...(post.threads || [])]) {
                        if (p?.postId === postId) {
                            patcher(p);
                        }
                    }
                }
            }
        });
    });
}

export function toggleLike(queryClient: QueryClient, source: SocialPlatform, postId: string) {
    patchPostQueryData(queryClient, source, postId, (draft) => {
        draft.hasLiked = !draft.hasLiked;
        draft.stats = produce(draft.stats, (old) => {
            return {
                ...old,
                comments: old?.comments || 0,
                mirrors: old?.mirrors || 0,
                reactions: (old?.reactions || 0) + (draft?.hasLiked ? 1 : -1),
            };
        });
    });
}

export function toggleMirror(queryClient: QueryClient, source: SocialPlatform, postId: string) {
    patchPostQueryData(queryClient, source, postId, (draft) => {
        draft.hasMirrored = !draft.hasMirrored;
        draft.stats = produce(draft.stats, (old) => {
            return {
                ...old,
                comments: old?.comments || 0,
                reactions: old?.reactions || 0,
                mirrors: (old?.mirrors || 0) + (draft?.hasMirrored ? 1 : -1),
            };
        });
    });
}
