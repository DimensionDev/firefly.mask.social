import { t } from '@lingui/macro';
import { safeUnreachable } from '@masknet/kit';
import { first } from 'lodash-es';

import { type SocialSource } from '@/constants/enum.js';
import type { Post } from '@/providers/types/SocialMedia.js';
import { type CompositePost, useComposeStateStore } from '@/store/useComposeStore.js';
import type { ComposeType } from '@/types/compose.js';
import type { MediaObject } from '@/types/index.js';

type Options = Record<
    ComposeType,
    (images: MediaObject[], videos: MediaObject[], poll?: Post['poll']) => Promise<string>
> & {
    uploadImages?: () => Promise<MediaObject[]>;
    uploadVideos?: () => Promise<MediaObject[]>;
    createPoll?: () => Promise<Post['poll']>;
};

export function createPostTo(source: SocialSource, options: Options) {
    const { updatePostInThread } = useComposeStateStore.getState();

    return async (type: ComposeType, post: CompositePost) => {
        const uploadedImages: MediaObject[] = (await options.uploadImages?.()) ?? [];
        const uploadedVideos: MediaObject[] = (await options.uploadVideos?.()) ?? [];
        const poll = await options.createPoll?.();

        updatePostInThread(post.id, (x) => ({
            ...x,
            images: uploadedImages,
            video: first(uploadedVideos) ?? null,
        }));

        const postTo = async () => {
            const parentPost = post.parentPost[source];
            switch (type) {
                case 'compose': {
                    const postId = await options.compose(uploadedImages, uploadedVideos, poll);
                    return postId;
                }
                case 'reply':
                    if (!parentPost) throw new Error(t`No parent post found.`);
                    const commentId = await options.reply(uploadedImages, uploadedVideos, poll);
                    return commentId;
                case 'quote': {
                    if (!parentPost) throw new Error(t`No parent post found.`);
                    const postId = await options.quote(uploadedImages, uploadedVideos);
                    return postId;
                }
                default:
                    safeUnreachable(type);
                    throw new Error(t`Invalid compose type: ${type}.`);
            }
        };

        const postId = await postTo();
        updatePostInThread(post.id, (x) => ({
            ...x,
            postId: {
                ...x.postId,
                [source]: postId,
            },
        }));
        return postId;
    };
}
