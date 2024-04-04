import { first } from 'lodash-es';

import { MAX_POST_SIZE_PER_THREAD } from '@/constants/index.js';
import { isSameProfile } from '@/helpers/isSameProfile.js';
import { LensSocialMediaProvider } from '@/providers/lens/SocialMedia.js';
import type { Post } from '@/providers/types/SocialMedia.js';

export async function getLensThreadByPostId(
    postId: string,
    post?: Post,
    maxDepth = MAX_POST_SIZE_PER_THREAD,
): Promise<string[]> {
    const result: string[] = [];

    if (maxDepth === 0) return result;

    const author = post?.author ?? (await LensSocialMediaProvider.getPostById(postId)).author;

    const comments = await LensSocialMediaProvider.getCommentsById(postId, undefined, false);
    const firstComment = first(comments.data);

    if (firstComment && isSameProfile(firstComment?.author, author)) {
        result.push(firstComment.postId);
        return result.concat(await getLensThreadByPostId(firstComment.postId, firstComment, maxDepth - 1));
    }

    return result;
}
