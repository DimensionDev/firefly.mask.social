import { produce } from 'immer';

import { queryClient } from '@/configs/queryClient.js';
import { type SocialSource, Source } from '@/constants/enum.js';
import { patchPostQueryData } from '@/helpers/patchPostQueryData.js';
import type { Post } from '@/providers/types/SocialMedia.js';

export function deletePostFromQueryData(source: SocialSource, postId: string) {
    if (source === Source.Lens) {
        queryClient.setQueriesData<{ pages: Array<{ data: Post[] }> }>({ queryKey: ['posts', source] }, (old) => {
            if (!old?.pages) return old;
            return produce(old, (draft) => {
                for (const page of draft.pages) {
                    const index = page.data.findIndex((p) => p.postId === postId);
                    if (index !== -1) page.data.splice(index, 1);
                }
            });
        });
    } else {
        patchPostQueryData(source, postId, (p) => {
            p.isHidden = true;
        });
    }
}
