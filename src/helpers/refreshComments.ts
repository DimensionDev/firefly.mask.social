import { produce } from 'immer';

import { queryClient } from '@/configs/queryClient.js';
import type { SocialPlatform } from '@/constants/enum.js';
import type { Post } from '@/providers/types/SocialMedia.js';

/**
 * Refetch comments and insert the new comment into comments optimistically
 */
export function refreshComments(source: SocialPlatform, postId: string, mockPost: Post | null) {
    const queryKey = ['posts', source, 'comments', postId];
    if (mockPost) {
        queryClient.setQueriesData<{ pages: Array<{ data: Post[] }> }>({ queryKey }, (data) => {
            if (!data?.pages.length) return data;
            return produce(data, (draft) => {
                draft.pages[0].data.unshift(mockPost);
            });
        });
    }
    return queryClient.refetchQueries({
        queryKey: ['posts', source, 'comments', postId],
    });
}
