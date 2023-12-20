import { t } from '@lingui/macro';
import { useCallback } from 'react';

import { SocialPlatform } from '@/constants/enum.js';
import { useCustomSnackbar } from '@/hooks/useCustomSnackbar.js';
import { HubbleSocialMediaProvider } from '@/providers/hubble/SocialMedia.js';
import { uploadToImgur } from '@/services/uploadToImgur.js';
import { useComposeStateStore } from '@/store/useComposeStore.js';
import { useFarcasterStateStore } from '@/store/useFarcasterStore.js';
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
                    if (media.imgur) return media;
                    const url = await uploadToImgur(media.file);
                    const patchedMedia: MediaObject = {
                        ...media,
                        imgur: url,
                    };
                    updateImages((originImages) => {
                        return originImages.map((x) => (x.file === media.file ? { ...x, imgur: url } : x));
                    });
                    // We only care about imgur for Farcaster
                    return patchedMedia;
                }),
            );
            try {
                const published = await HubbleSocialMediaProvider.publishPost(
                    {
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
                    },
                    type === 'reply' ? post : undefined,
                );
                enqueueSnackbar(t`Posted on Farcaster`, {
                    variant: 'success',
                });
                if (type === 'compose') {
                    updateFarcasterPostId(published.postId);
                }
            } catch (error) {
                enqueueSnackbar(
                    type === 'compose' ? t`Failed to post on Farcaster` : t`Failed to reply post on Farcaster`,
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
                enqueueSnackbar(t`Failed to mirror post on Farcaster`, {
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
        content,
        updateFarcasterPostId,
        enqueueSnackbar,
    ]);
}
