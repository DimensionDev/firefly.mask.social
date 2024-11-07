import { t } from '@lingui/macro';
import { safeUnreachable } from '@masknet/kit';
import { first } from 'lodash-es';

import { type SocialSource, Source } from '@/constants/enum.js';
import { UnreachableError } from '@/constants/error.js';
import { mergeMediaObjects } from '@/helpers/mergeMediaObjects.js';
import { runInSafeAsync } from '@/helpers/runInSafe.js';
import { TwitterSocialMediaProvider } from '@/providers/twitter/SocialMedia.js';
import type { Poll } from '@/providers/types/Poll.js';
import { type CompositePost, useComposeStateStore } from '@/store/useComposeStore.js';
import type { ComposeType, MediaObject } from '@/types/compose.js';

type Options = Record<
    ComposeType,
    (images: MediaObject[], videos: MediaObject[], polls?: Poll[]) => Promise<string>
> & {
    uploadPolls?: () => Promise<Poll[]>;
    uploadImages?: () => Promise<MediaObject[]>;
    uploadVideos?: () => Promise<MediaObject[]>;
};

export function createPostTo(source: SocialSource, options: Options) {
    const { updatePostInThread, updatePoll } = useComposeStateStore.getState();

    return async (type: ComposeType, post: CompositePost) => {
        const uploadedImages: MediaObject[] = (await options.uploadImages?.()) ?? [];
        const uploadedVideos: MediaObject[] = (await options.uploadVideos?.()) ?? [];
        const polls = (await options.uploadPolls?.()) ?? [];

        updatePostInThread(post.id, (post) => ({
            ...post,
            images: mergeMediaObjects(post.images, uploadedImages),
            video: first(uploadedVideos) ?? null,
        }));

        const postTo = async () => {
            const parentPost = post.parentPost[source];
            switch (type) {
                case 'compose': {
                    const postId = await options.compose(uploadedImages, uploadedVideos, polls);
                    return postId;
                }
                case 'reply':
                    if (!parentPost) throw new Error(t`No parent post found.`);
                    const commentId = await options.reply(uploadedImages, uploadedVideos, polls);
                    return commentId;
                case 'quote': {
                    if (!parentPost) throw new Error(t`No parent post found.`);
                    const postId = await options.quote(uploadedImages, uploadedVideos);
                    return postId;
                }
                default:
                    safeUnreachable(type);
                    throw new UnreachableError('compose type', type);
            }
        };

        const postId = await postTo();

        // update poll id for twitter
        if (source === Source.Twitter && postId && post.poll) {
            const tweet = await runInSafeAsync(() => TwitterSocialMediaProvider.getPostById(postId));
            if (tweet?.poll?.id) {
                post.poll = { ...post.poll, idMap: { ...post.poll.idMap, [Source.Twitter]: tweet.poll.id } };
                updatePoll({ ...post.poll });
            }
        }

        updatePostInThread(post.id, (post) => ({
            ...post,
            postId: {
                ...post.postId,
                [source]: postId,
            },
        }));
        return postId;
    };
}
