import { t } from '@lingui/macro';
import { safeUnreachable } from '@masknet/kit';
import { first } from 'lodash-es';

import { SocialPlatform } from '@/constants/enum.js';
import { type CompositePost, useComposeStateStore } from '@/store/useComposeStore.js';
import type { ComposeType } from '@/types/compose.js';
import type { MediaObject } from '@/types/index.js';

export type CreatePostToOptions = Record<
    ComposeType,
    (images: MediaObject[], videos: MediaObject[]) => Promise<string>
> & {
    noSuccessMessage?: boolean;
    noErrorMessage?: boolean;
    uploadImages?: () => Promise<MediaObject[]>;
    uploadVideos?: () => Promise<MediaObject[]>;
};

export function createPostTo(source: SocialPlatform, options: CreatePostToOptions) {
    const { updatePostInThread } = useComposeStateStore.getState();

    return async (type: ComposeType, post: CompositePost) => {
        const uploadedImages: MediaObject[] = (await options.uploadImages?.()) ?? [];
        const uploadedVideos: MediaObject[] = (await options.uploadVideos?.()) ?? [];

        updatePostInThread(post.id, (x) => ({
            ...x,
            images: uploadedImages,
            video: first(uploadedVideos) ?? null,
        }));

        const postTo = async () => {
            const parentPost = post.parentPost[source];
            switch (type) {
                case 'compose': {
                    const postId = await options.compose(uploadedImages, uploadedVideos);
                    return postId;
                }
                case 'reply':
                    if (!parentPost) throw new Error(t`No parent post found.`);
                    const commentId = await options.reply(uploadedImages, uploadedVideos);
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
