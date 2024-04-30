import { t } from '@lingui/macro';
import { safeUnreachable } from '@masknet/kit';
import { first, noop } from 'lodash-es';

import { SocialPlatform } from '@/constants/enum.js';
import { enqueueErrorMessage, enqueueSuccessMessage } from '@/helpers/enqueueMessage.js';
import { getDetailedErrorMessage } from '@/helpers/getDetailedErrorMessage.js';
import { resolveSourceName } from '@/helpers/resolveSourceName.js';
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

    const sourceName = resolveSourceName(source);
    const enqueueSuccessMessage_ = options.noSuccessMessage ? noop : enqueueSuccessMessage;
    const enqueueErrorMessage_ = options.noErrorMessage ? noop : enqueueErrorMessage;

    return async (type: ComposeType, post: CompositePost) => {
        let uploadedImages: MediaObject[] = [];
        let uploadedVideos: MediaObject[] = [];

        try {
            if (options.uploadImages) {
                uploadedImages = await options.uploadImages?.();
            }
        } catch (error) {
            enqueueErrorMessage_(t`Failed to upload image to ${sourceName}.`, {
                detailed: getDetailedErrorMessage(source, error),
            });
            throw error;
        }

        try {
            if (options.uploadVideos) {
                uploadedVideos = await options.uploadVideos?.();
            }
        } catch (error) {
            enqueueErrorMessage_(t`Failed to upload video to ${sourceName}.`, {
                detailed: getDetailedErrorMessage(source, error),
            });
            throw error;
        }

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
                    throw new Error(t`Invalid compose type.`);
            }
        };

        try {
            const postId = await postTo();

            updatePostInThread(post.id, (x) => ({
                ...x,
                postId: {
                    ...x.postId,
                    [source]: postId,
                },
            }));
            enqueueSuccessMessage_(t`Your post has published successfully on ${sourceName}.`);
        } catch (error) {
            enqueueErrorMessage_(t`Your post failed to publish on ${sourceName}.`, {
                detailed: getDetailedErrorMessage(source, error),
            });
            throw error;
        }
    };
}
