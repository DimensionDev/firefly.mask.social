import type { SocialSource } from '@/constants/enum.js';
import { patchPostQueryData } from '@/helpers/patchPostQueryData.js';

export function deletePostFromQueryData(source: SocialSource, postId: string) {
    patchPostQueryData(source, postId, (p) => {
        p.isHidden = true;
    });
}
