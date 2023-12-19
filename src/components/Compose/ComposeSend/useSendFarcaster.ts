import { t } from '@lingui/macro';
import { useCallback } from 'react';

import { SocialPlatform } from '@/constants/enum.js';
import { useCustomSnackbar } from '@/hooks/useCustomSnackbar.js';
import { ComposeModalRef } from '@/modals/controls.js';
import { HubbleSocialMediaProvider } from '@/providers/hubble/SocialMedia.js';
import { useComposeStateStore } from '@/store/useComposeStore.js';
import { useFarcasterStateStore } from '@/store/useFarcasterStore.js';

export function useSendFarcaster() {
    const { type, chars: content, post, imgurImages } = useComposeStateStore();
    const enqueueSnackbar = useCustomSnackbar();
    const currentProfile = useFarcasterStateStore.use.currentProfile();

    return useCallback(async () => {
        if (!currentProfile?.profileId) return;
        if (type === 'compose' || type === 'reply') {
            try {
                await HubbleSocialMediaProvider.publishPost(
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
                        mediaObjects: imgurImages,
                    },
                    post,
                );
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
    }, [currentProfile, type, post, content, imgurImages, enqueueSnackbar]);
}
