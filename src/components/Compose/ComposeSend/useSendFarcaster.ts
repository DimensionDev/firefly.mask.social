import { t } from '@lingui/macro';
import { useCallback } from 'react';

import { SocialPlatform } from '@/constants/enum.js';
import { useCustomSnackbar } from '@/hooks/useCustomSnackbar.js';
import { ComposeModalRef } from '@/modals/controls.js';
import { HubbleSocialMediaProvider } from '@/providers/hubble/SocialMedia.js';
import { uploadToImgur } from '@/services/uploadToImgur.js';
import { useComposeStateStore } from '@/store/useComposeStore.js';
import { useFarcasterStateStore } from '@/store/useFarcasterStore.js';
import type { MediaObject } from '@/types/index.js';

export function useSendFarcaster() {
    const { type, chars: content, post, images, updateImageByIndex, updateFarcasterPostId } = useComposeStateStore();
    const enqueueSnackbar = useCustomSnackbar();
    const currentProfile = useFarcasterStateStore.use.currentProfile();

    return useCallback(async () => {
        if (!currentProfile?.profileId) return;
        if (type === 'compose' || type === 'reply') {
            const uploadedImages = await Promise.all(
                images.map(async (media, index) => {
                    if (media.ipfs) return media;
                    const url = await uploadToImgur(media.file);
                    const patchedMedia: MediaObject = {
                        ...media,
                        imgur: url,
                    };
                    // TODO race conditions
                    updateImageByIndex(index, patchedMedia);
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
                    post,
                );
                updateFarcasterPostId(published.postId);
                enqueueSnackbar(t`Posted on Farcaster`, {
                    variant: 'success',
                });
                ComposeModalRef.close();
            } catch (err) {
                enqueueSnackbar(
                    t`Failed to ${type === 'compose' ? 'post' : 'reply'} on Farcaster: ${(err as Error).message}`,
                    {
                        variant: 'error',
                    },
                );
            }
        }
        if (type === 'quote' && post?.postId) {
            try {
                await HubbleSocialMediaProvider.mirrorPost(post.postId);
            } catch (err) {
                enqueueSnackbar(t`Failed to mirror on Farcaster: ${(err as Error).message}`, {
                    variant: 'error',
                });
            }
        }
    }, [currentProfile, type, post, images, updateImageByIndex, content, updateFarcasterPostId, enqueueSnackbar]);
}
