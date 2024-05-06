import { type Draft, produce } from 'immer';

import { queryClient } from '@/configs/queryClient.js';
import type { SocialSource } from '@/constants/enum.js';
import type { Post } from '@/providers/types/SocialMedia.js';

type Patcher = (old: Draft<Post>) => void;

export function patchPostQueryData(source: SocialSource, postId: string, patcher: Patcher) {
    queryClient.setQueriesData<Post>({ queryKey: [source, 'post-detail'] }, (old) => {
        if (!old) return old;

        return produce(old, (draft) => {
            for (const p of [draft, draft.root, draft.commentOn]) {
                if (p?.postId === postId) {
                    patcher(p);
                }
            }
        });
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
