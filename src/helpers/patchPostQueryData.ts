import { type Draft, produce } from 'immer';

import { queryClient } from '@/configs/queryClient.js';
import type { Source } from '@/constants/enum.js';
import type { Post } from '@/providers/types/SocialMedia.js';

type Patcher = (old: Draft<Post>) => void;
export type Matcher = string | ((post: Draft<Post> | null | undefined) => boolean);

export function patchPostQueryData(source: Source, postId: Matcher, patcher: Patcher) {
    const matcher: Matcher = typeof postId === 'string' ? (post) => post?.postId === postId : postId;

    queryClient.setQueriesData<Post>({ queryKey: [source, 'post-detail'] }, (old) => {
        if (!old) return old;

        return produce(old, (draft) => {
            for (const p of [draft, draft.root, draft.commentOn]) {
                if (matcher(p)) {
                    patcher(p!);
                }
            }
        });
    });

    queryClient.setQueriesData<{ pages: Array<{ data: Post[] }> }>({ queryKey: ['posts', source] }, (old) => {
        if (!old?.pages) return old;

        return produce(old, (draft) => {
            for (const page of draft.pages) {
                if (!page) continue;
                for (const post of page.data) {
                    for (const p of [post, post.commentOn, post.root, post.quoteOn, ...(post.threads || [])]) {
                        if (matcher(p)) {
                            patcher(p!);
                        }
                    }
                }
            }
        });
    });
}
