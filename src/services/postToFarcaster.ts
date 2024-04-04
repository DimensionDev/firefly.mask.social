import { t } from '@lingui/macro';
import { safeUnreachable } from '@masknet/kit';
import { uniqBy } from 'lodash-es';

import { queryClient } from '@/configs/queryClient.js';
import { SocialPlatform } from '@/constants/enum.js';
import { enqueueErrorMessage, enqueueSuccessMessage } from '@/helpers/enqueueMessage.js';
import { hasRpPayload } from '@/helpers/hasPayload.js';
import { readChars } from '@/helpers/readChars.js';
import { FarcasterSocialMediaProvider } from '@/providers/farcaster/SocialMedia.js';
import { type Post } from '@/providers/types/SocialMedia.js';
import { uploadToImgur } from '@/services/uploadToImgur.js';
import { type CompositePost, useComposeStateStore } from '@/store/useComposeStore.js';
import { useFarcasterStateStore } from '@/store/useProfileStore.js';
import type { ComposeType } from '@/types/compose.js';

export async function postToFarcaster(type: ComposeType, compositePost: CompositePost) {
    const { chars, parentPost, images, frames, openGraphs, typedMessage, postId } = compositePost;

    const farcasterPostId = postId.Farcaster;
    const farcasterParentPost = parentPost.Farcaster;

    // already posted to lens
    if (farcasterPostId) throw new Error(t`Already posted on Farcaster.`);

    // login required
    const { currentProfile } = useFarcasterStateStore.getState();
    if (!currentProfile?.profileId) throw new Error(t`Login required to post on Lens.`);

    const { updatePostInThread } = useComposeStateStore.getState();

    const uploadedImages = await Promise.all(
        images.map(async (media) => {
            try {
                if (media.imgur) return media;
                return {
                    ...media,
                    imgur: await uploadToImgur(media.file),
                };
            } catch (error) {
                enqueueErrorMessage(t`Failed to upload image to imgur.`);
                throw error;
            }
        }),
    );

    updatePostInThread(compositePost.id, (x) => ({
        ...x,
        images: uploadedImages,
    }));

    const hasPayload = hasRpPayload(typedMessage);
    const draft: Post = {
        type: 'Post',
        postId: '',
        source: SocialPlatform.Farcaster,
        author: currentProfile,
        metadata: {
            locale: '',
            content: {
                content: readChars(chars),
            },
        },
        mediaObjects: uniqBy(
            [
                ...uploadedImages.map((media) => ({ url: media.imgur!, mimeType: media.file.type })),
                ...frames.map((frame) => ({ title: frame.title, url: frame.url })),
                ...openGraphs.map((openGraph) => ({ title: openGraph.title!, url: openGraph.url })),
            ],
            (x) => x.url.toLowerCase(),
        ),
        commentOn: type === 'reply' && farcasterParentPost ? farcasterParentPost : undefined,
        parentChannelKey: hasPayload ? 'firefly-garden' : undefined,
        parentChannelUrl: hasPayload ? 'https://warpcast.com/~/channel/firefly-garden' : undefined,
    };

    switch (type) {
        case 'compose':
            try {
                const postId = await FarcasterSocialMediaProvider.publishPost(draft);
                enqueueSuccessMessage(t`Posted on Farcaster.`);
                updatePostInThread(compositePost.id, (x) => ({
                    ...x,
                    postId: {
                        ...x.postId,
                        [SocialPlatform.Farcaster]: postId,
                    },
                }));
                return postId;
            } catch (error) {
                enqueueErrorMessage(t`Failed to post on Farcaster.`);
                throw error;
            }
        case 'reply':
            if (!farcasterParentPost) throw new Error(t`No parent post found.`);
            try {
                const commentId = await FarcasterSocialMediaProvider.publishPost(draft);
                enqueueSuccessMessage(t`Replied on Farcaster.`);
                updatePostInThread(compositePost.id, (x) => ({
                    ...x,
                    postId: {
                        ...x.postId,
                        [SocialPlatform.Farcaster]: commentId,
                    },
                }));

                queryClient.invalidateQueries({
                    queryKey: [farcasterParentPost.source, 'post-detail', farcasterParentPost.postId],
                });
                queryClient.invalidateQueries({
                    queryKey: ['post-detail', 'comments', farcasterParentPost.source, farcasterParentPost.postId],
                });

                return commentId;
            } catch (error) {
                enqueueErrorMessage(t`Failed to reply post on Farcaster.`);
                throw error;
            }
        case 'quote':
            if (!farcasterParentPost) throw new Error(t`No parent post found.`);
            try {
                const postId = await FarcasterSocialMediaProvider.mirrorPost(farcasterParentPost.postId);
                enqueueSuccessMessage(t`Recasted post on Farcaster.`);
                updatePostInThread(compositePost.id, (x) => ({
                    ...x,
                    postId: {
                        ...x.postId,
                        [SocialPlatform.Farcaster]: postId,
                    },
                }));
                return postId;
            } catch (error) {
                enqueueErrorMessage(t`Failed to recast post on Farcaster.`);
                throw error;
            }
        default:
            safeUnreachable(type);
            throw new Error(t`Invalid compose type.`);
    }
}
