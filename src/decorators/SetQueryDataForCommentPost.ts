import { produce } from 'immer';

import { SocialPlatform } from '@/constants/enum.js';
import { patchPostQueryData } from '@/helpers/patchPostQueryData.js';
import type { HubbleSocialMedia } from '@/providers/hubble/SocialMedia.js';
import type { LensSocialMedia } from '@/providers/lens/SocialMedia.js';
import type { Post } from '@/providers/types/SocialMedia.js';
import type { ClassType } from '@/types/index.js';

function commentPost(source: SocialPlatform, postId: string) {
    patchPostQueryData(source, postId, (draft) => {
        draft.stats = produce(draft.stats, (old) => {
            return {
                ...old,
                comments: (old?.comments || 0) + 1,
                mirrors: old?.mirrors || 0,
                reactions: old?.reactions || 0,
            };
        });
    });
}

export function SetQueryDataForCommentPostOnLens(target: ClassType<LensSocialMedia>): ClassType<LensSocialMedia> {
    const method = target.prototype.commentPost as LensSocialMedia['commentPost'];

    Object.defineProperty(target.prototype, 'commentPost', {
        value: async (postId: string, post: Post, signless?: boolean, onMomoka?: boolean) => {
            const result = await method!.call(target.prototype, postId, post, signless, onMomoka);

            commentPost(SocialPlatform.Lens, postId);

            return result;
        },
    });

    return target;
}

export function SetQueryDataForCommentPostOnFarcaster(
    target: ClassType<HubbleSocialMedia>,
): ClassType<HubbleSocialMedia> {
    const method = target.prototype.publishPost as LensSocialMedia['publishPost'];

    Object.defineProperty(target.prototype, 'publishPost', {
        value: async (post: Post) => {
            const result = await method!.call(target.prototype, post);

            if (post.commentOn) {
                commentPost(SocialPlatform.Farcaster, post.commentOn.postId);
            }

            return result;
        },
    });

    return target;
}
