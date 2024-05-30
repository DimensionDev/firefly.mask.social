import { type Draft, produce } from 'immer';

import { queryClient } from '@/configs/queryClient.js';
import { SearchType, type Source } from '@/constants/enum.js';
import type { Post } from '@/providers/types/SocialMedia.js';

type Patcher = (old: Draft<Post>) => void;
export type Matcher = string | ((post: Draft<Post> | null | undefined) => boolean);

/**
 * Patch all post lists, including post searching result
 */
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

    type Data = { pages: Array<{ data: Post[] }> };

    const PostsPatcher = (old: Data | undefined) => {
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
    };

    queryClient.setQueriesData<Data>({ queryKey: ['posts', source] }, PostsPatcher);
    queryClient.setQueriesData<Data>({ queryKey: ['search', SearchType.Posts] }, PostsPatcher);
}
