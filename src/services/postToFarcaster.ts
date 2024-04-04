import { t } from '@lingui/macro';
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
import type { MediaObject } from '@/types/index.js';

export async function postToFarcaster(type: ComposeType, compositePost: CompositePost) {
    const { chars, parentPost, images, frames, openGraphs, typedMessage, postId } = compositePost;

    const farcasterPostId = postId.Farcaster;
    const farcasterParentPost = parentPost.Farcaster;

    // already posted to lens
    if (farcasterPostId) throw new Error(t`Post already posted on Farcaster`);

    // no parent post to reply or quote
    if (!farcasterParentPost && type !== 'compose') throw new Error(t`No parent post found.`);

    // login required
    const { currentProfile } = useFarcasterStateStore.getState();
    if (!currentProfile?.profileId) throw new Error(t`Login required to post on Lens.`);

    const { updatePostInThread } = useComposeStateStore.getState();

    if (type === 'compose' || type === 'reply') {
        const uploadedImages = await Promise.all(
            images.map(async (media) => {
                try {
                    if (media.imgur) return media;
                    const patchedMedia: MediaObject = {
                        ...media,
                        imgur: await uploadToImgur(media.file),
                    };
                    updatePostInThread(compositePost.id, (x) => ({
                        ...x,
                        images: x.images.map((y) => (y.file === media.file ? patchedMedia : y)),
                    }));
                    // We only care about imgur for Farcaster
                    return patchedMedia;
                } catch (error) {
                    enqueueErrorMessage(t`Failed to upload image to imgur.`);
                    throw error;
                }
            }),
        );
        try {
            const hasRp = hasRpPayload(typedMessage);
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
                parentChannelKey: hasRp ? 'firefly-garden' : undefined,
                parentChannelUrl: hasRp ? 'https://warpcast.com/~/channel/firefly-garden' : undefined,
            };
            const postId = await FarcasterSocialMediaProvider.publishPost(draft);
            enqueueSuccessMessage(type === 'compose' ? t`Posted on Farcaster.` : t`Replied on Farcaster.`);
            if (type === 'reply' && farcasterParentPost) {
                queryClient.invalidateQueries({
                    queryKey: [farcasterParentPost.source, 'post-detail', farcasterParentPost.postId],
                });
                queryClient.invalidateQueries({
                    queryKey: ['post-detail', 'comments', farcasterParentPost.source, farcasterParentPost.postId],
                });
            }
            updatePostInThread(compositePost.id, (x) => ({
                ...x,
                postId: {
                    ...x.postId,
                    [SocialPlatform.Farcaster]: postId,
                },
            }));
            return postId;
        } catch (error) {
            enqueueErrorMessage(
                type === 'compose' ? t`Failed to post on Farcaster.` : t`Failed to reply post on Farcaster.`,
            );
            throw error;
        }
    }

    if (type === 'quote') {
        try {
            const postId = await FarcasterSocialMediaProvider.mirrorPost(farcasterParentPost!.postId);
            return postId;
        } catch (error) {
            enqueueErrorMessage(t`Failed to mirror post on Farcaster.`);
            throw error;
        }
    }

    throw new Error(t`Invalid compose type.`);
}
