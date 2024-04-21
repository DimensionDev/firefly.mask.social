import { t } from '@lingui/macro';
import { safeUnreachable } from '@masknet/kit';
import { first, noop } from 'lodash-es';

import { SocialPlatform } from '@/constants/enum.js';
import { enqueueErrorMessage, enqueueSuccessMessage } from '@/helpers/enqueueMessage.js';
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
            enqueueErrorMessage_(t`Failed to upload image to ${sourceName}.`, error);
            throw error;
        }

        try {
            if (options.uploadVideos) {
                uploadedVideos = await options.uploadVideos?.();
            }
        } catch (error) {
            enqueueErrorMessage_(t`Failed to upload video to ${sourceName}.`, error);
            throw error;
        }

        updatePostInThread(post.id, (x) => ({
            ...x,
            images: uploadedImages,
            video: first(uploadedVideos) ?? null,
        }));

        const parentPost = post.parentPost[source];

        switch (type) {
            case 'compose':
                try {
                    const postId = await options.compose(uploadedImages, uploadedVideos);
                    enqueueSuccessMessage_(t`Posted on ${sourceName}.`);
                    updatePostInThread(post.id, (x) => ({
                        ...x,
                        postId: {
                            ...x.postId,
                            [source]: postId,
                        },
                    }));
                    return postId;
                } catch (error) {
                    enqueueErrorMessage_(t`Failed to post on ${sourceName}.`, error);
                    throw error;
                }
            case 'reply':
                if (!parentPost) throw new Error(t`No parent post found.`);
                try {
                    const commentId = await options.reply(uploadedImages, uploadedVideos);
                    enqueueSuccessMessage_(t`Replied on ${sourceName}.`);
                    updatePostInThread(post.id, (x) => ({
                        ...x,
                        postId: {
                            ...x.postId,
                            [source]: commentId,
                        },
                    }));

                    return commentId;
                } catch (error) {
                    enqueueErrorMessage_(t`Failed to relay post on ${sourceName}.`, error);
                    throw error;
                }
            case 'quote':
                if (!parentPost) throw new Error(t`No parent post found.`);
                try {
                    const postId = await options.quote(uploadedImages, uploadedVideos);
                    enqueueSuccessMessage_(t`Quoted post on ${sourceName}.`);
                    updatePostInThread(post.id, (x) => ({
                        ...x,
                        postId: {
                            ...x.postId,
                            [source]: postId,
                        },
                    }));
                    return postId;
                } catch (error) {
                    enqueueErrorMessage_(t`Failed to quote post on ${sourceName}.`, error);
                    throw error;
                }
            default:
                safeUnreachable(type);
                throw new Error(t`Invalid compose type.`);
        }
    };
}
