import { produce } from 'immer';

import { queryClient } from '@/configs/queryClient.js';
import type { SocialPlatform } from '@/constants/enum.js';
import type { Post } from '@/providers/types/SocialMedia.js';

export function deletePostFromQueryData(source: SocialPlatform, postId: string) {
    queryClient.setQueriesData<{ pages: Array<{ data: Post[] }> }>({ queryKey: ['posts', source] }, (old) => {
        if (!old?.pages) return old;

        return produce(old, (draft) => {
            for (const page of draft.pages) {
                const index = page.data.findIndex((p) => p.postId === postId);
                page.data.splice(index, 1);
            }
        });
    });
}
