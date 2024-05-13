import { produce } from 'immer';

import { queryClient } from '@/configs/queryClient.js';
import type { SocialSource } from '@/constants/enum.js';
import type { Post } from '@/providers/types/SocialMedia.js';

/**
 * @deprecated
 */
export function deletePostsOfUserFromQueryData(source: SocialSource, profileId: string) {
    queryClient.setQueriesData<{ pages: Array<{ data: Post[] }> }>({ queryKey: ['posts', source] }, (old) => {
        if (!old?.pages) return old;

        return produce(old, (draft) => {
            for (const page of draft.pages) {
                const index = page.data.findIndex((p) => p.author.profileId === profileId);
                page.data.splice(index, 1);
            }
        });
    });
}
