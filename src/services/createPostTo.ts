import { t } from '@lingui/macro';
import { safeUnreachable } from '@masknet/kit';
import { first } from 'lodash-es';

import { queryClient } from '@/configs/queryClient.js';
import { SocialPlatform } from '@/constants/enum.js';
import { enqueueErrorMessage, enqueueSuccessMessage } from '@/helpers/enqueueMessage.js';
import { resolveSourceName } from '@/helpers/resolveSourceName.js';
import { type CompositePost, useComposeStateStore } from '@/store/useComposeStore.js';
import type { ComposeType } from '@/types/compose.js';
import type { MediaObject } from '@/types/index.js';

type Options = Record<ComposeType, (images: MediaObject[], videos: MediaObject[]) => Promise<string>> & {
    uploadImages?: () => Promise<MediaObject[]>;
    uploadVideos?: () => Promise<MediaObject[]>;
};

export function createPostTo(source: SocialPlatform, options: Options) {
    const { updatePostInThread } = useComposeStateStore.getState();

    const sourceName = resolveSourceName(source);

    return async (type: ComposeType, post: CompositePost) => {
        let uploadedImages: MediaObject[] = [];
        let uploadedVideos: MediaObject[] = [];

        try {
            if (options.uploadImages) {
                uploadedImages = await options.uploadImages?.();
            }
        } catch (error) {
            enqueueErrorMessage(t`Failed to upload image to ${sourceName}.`);
            throw error;
        }

        try {
            if (options.uploadVideos) {
                uploadedVideos = await options.uploadVideos?.();
            }
        } catch (error) {
            enqueueErrorMessage(t`Failed to upload video to ${sourceName}.`);
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
                    enqueueSuccessMessage(t`Posted on ${sourceName}.`);
                    updatePostInThread(post.id, (x) => ({
                        ...x,
                        postId: {
                            ...x.postId,
                            [source]: postId,
                        },
                    }));
                    return postId;
                } catch (error) {
                    enqueueErrorMessage(t`Failed to post on ${sourceName}.`);
                    throw error;
                }
            case 'reply':
                if (!parentPost) throw new Error(t`No parent post found.`);
                try {
                    const commentId = await options.reply(uploadedImages, uploadedVideos);
                    enqueueSuccessMessage(t`Replied on ${sourceName}.`);
                    updatePostInThread(post.id, (x) => ({
                        ...x,
                        postId: {
                            ...x.postId,
                            [source]: commentId,
                        },
                    }));

                    queryClient.invalidateQueries({ queryKey: [parentPost.source, 'post-detail', parentPost.postId] });
                    queryClient.invalidateQueries({
                        queryKey: ['posts', parentPost.source, 'comments', parentPost.postId],
                    });

                    return commentId;
                } catch (error) {
                    enqueueErrorMessage(t`Failed to relay post on ${sourceName}.`);
                    throw error;
                }
            case 'quote':
                if (!parentPost) throw new Error(t`No parent post found.`);
                try {
                    const postId = await options.quote(uploadedImages, uploadedVideos);
                    enqueueSuccessMessage(t`Quoted post on ${sourceName}.`);
                    updatePostInThread(post.id, (x) => ({
                        ...x,
                        postId: {
                            ...x.postId,
                            [source]: postId,
                        },
                    }));

                    await queryClient.setQueryData([parentPost.source, 'post-detail', parentPost.postId], {
                        ...parentPost,
                        hasQuoted: true,
                    });

                    return postId;
                } catch (error) {
                    enqueueErrorMessage(t`Failed to quote post on ${sourceName}.`);
                    throw error;
                }
            default:
                safeUnreachable(type);
                throw new Error(t`Invalid compose type.`);
        }
    };
}
