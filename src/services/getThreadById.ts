import { safeUnreachable } from '@masknet/kit';

import { SocialPlatform } from '@/constants/enum.js';
import { LensSocialMediaProvider } from '@/providers/lens/SocialMedia.js';
import type { Post } from '@/providers/types/SocialMedia.js';

export async function getThreadById(source: SocialPlatform, post: Post): Promise<Post[]> {
    const result: Post[] = [];
    switch (source) {
        case SocialPlatform.Lens:
            const comments = await LensSocialMediaProvider.getCommentsById(post.postId);

            const target = comments.data.find((x) => x.author.profileId === post.author.profileId);
            if (target) {
                result.push(target);

                return result.concat(await getThreadById(source, target));
            }
            return result;

        case SocialPlatform.Farcaster:
            return result;
        default:
            safeUnreachable(source);
            return result;
    }
}
