import { t } from '@lingui/macro';
import { useCallback } from 'react';

import { SocialPlatform } from '@/constants/enum.js';
import { useCustomSnackbar } from '@/hooks/useCustomSnackbar.js';
import { FarcasterSocialMediaProvider } from '@/providers/farcaster/SocialMedia.js';
import { HubbleSocialMediaProvider } from '@/providers/hubble/SocialMedia.js';
import { type Post } from '@/providers/types/SocialMedia.js';
import { uploadToImgur } from '@/services/uploadToImgur.js';
import { useComposeStateStore } from '@/store/useComposeStore.js';
import { useFarcasterStateStore } from '@/store/useProfileStore.js';
import type { MediaObject } from '@/types/index.js';

export function useSendFarcaster() {
    const {
        type,
        chars: content,
        post,
        images,
        updateImages,
        farcasterPostId,
        updateFarcasterPostId,
    } = useComposeStateStore();
    const enqueueSnackbar = useCustomSnackbar();
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
                        const message = t`Failed to upload image to imgur: ${(error as Error).message}`;
                        enqueueSnackbar(message, { variant: 'error' });
                        throw new Error(message);
                    }
                }),
            );
            try {
                const draft: Post = {
                    type: 'Post',
                    postId: '',
                    source: SocialPlatform.Farcaster,
                    author: currentProfile,
                    metadata: {
                        locale: '',
                        content: {
                            content,
                        },
                    },
                    mediaObjects: uploadedImages.map((media) => ({ url: media.imgur!, mimeType: media.file.type })),
                    commentOn: type === 'reply' && post ? post : undefined,
                };
                const published = await FarcasterSocialMediaProvider.publishPost(draft);
                enqueueSnackbar(t`Posted on Farcaster`, {
                    variant: 'success',
                });
                if (type === 'compose') {
                    updateFarcasterPostId(published.postId);
                }
            } catch (error) {
                enqueueSnackbar(
                    type === 'compose' ? t`Failed to post on Farcaster.` : t`Failed to reply post on Farcaster.`,
                    {
                        variant: 'error',
                    },
                );
                throw error;
            }
        }
        if (type === 'quote' && post?.postId) {
            try {
                await HubbleSocialMediaProvider.mirrorPost(post.postId);
            } catch (error) {
                enqueueSnackbar(t`Failed to mirror post on Farcaster.`, {
                    variant: 'error',
                });
                throw error;
            }
        }
    }, [
        currentProfile,
        farcasterPostId,
        type,
        post,
        images,
        updateImages,
        enqueueSnackbar,
        content,
        updateFarcasterPostId,
    ]);
}
