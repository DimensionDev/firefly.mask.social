import { t } from '@lingui/macro';
import { uniqBy } from 'lodash-es';
import { useCallback } from 'react';

import { queryClient } from '@/configs/queryClient.js';
import { SocialPlatform } from '@/constants/enum.js';
import { enqueueErrorMessage, enqueueSuccessMessage } from '@/helpers/enqueueMessage.js';
import { hasRedPacketPayload } from '@/helpers/hasRedPacketPayload.js';
import { readChars } from '@/helpers/readChars.js';
import { FarcasterSocialMediaProvider } from '@/providers/farcaster/SocialMedia.js';
import { type Post } from '@/providers/types/SocialMedia.js';
import { uploadToImgur } from '@/services/uploadToImgur.js';
import { useComposeStateStore } from '@/store/useComposeStore.js';
import { useFarcasterStateStore } from '@/store/useProfileStore.js';
import type { MediaObject } from '@/types/index.js';

export function useSendFarcaster() {
    const {
        type,
        chars,
        post,
        images,
        frames,
        openGraphs,
        updateImages,
        farcasterPostId,
        updateFarcasterPostId,
        typedMessage,
    } = useComposeStateStore();
    const currentProfile = useFarcasterStateStore.use.currentProfile();

    return useCallback(async () => {
        if (!currentProfile?.profileId || farcasterPostId) return;
        if (type === 'compose' || type === 'reply') {
            const uploadedImages = await Promise.all(
                images.map(async (media) => {
                    try {
                        if (media.imgur) return media;
                        const imgur = await uploadToImgur(media.file);
                        const patchedMedia: MediaObject = {
                            ...media,
                            imgur,
                        };
                        updateImages((originImages) => {
                            return originImages.map((x) => (x.file === media.file ? patchedMedia : x));
                        });
                        // We only care about imgur for Farcaster
                        return patchedMedia;
                    } catch (error) {
                        const message = error instanceof Error ? error.message : t`Failed to upload image to imgur.`;
                        enqueueErrorMessage(message);
                        throw new Error(message);
                    }
                }),
            );
            try {
                const hasRedPacket = hasRedPacketPayload(typedMessage);
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
                    commentOn: type === 'reply' && post ? post : undefined,
                    parentChannelKey: hasRedPacket ? 'firefly-garden' : undefined,
                    parentChannelUrl: hasRedPacket ? 'https://warpcast.com/~/channel/firefly-garden' : undefined,
                };
                const published = await FarcasterSocialMediaProvider.publishPost(draft);
                enqueueSuccessMessage(t`Posted on Farcaster`);
                if (type === 'reply' && post) {
                    queryClient.invalidateQueries({ queryKey: [post.source, 'post-detail', post.postId] });
                    queryClient.invalidateQueries({
                        queryKey: ['post-detail', 'comments', post.source, post.postId],
                    });
                }
                if (type === 'compose') {
                    updateFarcasterPostId(published.postId);
                }
            } catch (error) {
                enqueueErrorMessage(
                    type === 'compose' ? t`Failed to post on Farcaster.` : t`Failed to reply post on Farcaster.`,
                );
                throw error;
            }
        }
        if (type === 'quote' && post?.postId) {
            try {
                await FarcasterSocialMediaProvider.mirrorPost(post.postId);
            } catch (error) {
                enqueueErrorMessage(t`Failed to mirror post on Farcaster.`);
                throw error;
            }
        }
    }, [
        typedMessage,
        currentProfile,
        farcasterPostId,
        type,
        post,
        chars,
        images,
        frames,
        openGraphs,
        updateImages,
        updateFarcasterPostId,
    ]);
}
