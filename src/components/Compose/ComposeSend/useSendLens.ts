import { t } from '@lingui/macro';
import { useCallback } from 'react';

import { commentPostForLens, publishPostForLens, quotePostForLens } from '@/helpers/publishPost.js';
import { useCustomSnackbar } from '@/hooks/useCustomSnackbar.js';
import { ComposeModalRef } from '@/modals/controls.js';
import { useComposeStateStore } from '@/store/useComposeStore.js';
import { useLensStateStore } from '@/store/useLensStore.js';

export function useSendLens() {
    const currentProfile = useLensStateStore.use.currentProfile();
    const { type, post, chars, images, video } = useComposeStateStore();
    const enqueueSnackbar = useCustomSnackbar();

    return useCallback(async () => {
        if (!currentProfile?.profileId) return;
        if (type === 'compose') {
            try {
                await publishPostForLens(currentProfile.profileId, chars, images, video);
                enqueueSnackbar(t`Posted on Lens`, {
                    variant: 'success',
                });
                ComposeModalRef.close();
            } catch {
                enqueueSnackbar(t`Failed to post on Lens`, {
                    variant: 'error',
                });
            }
        } else if (type === 'reply') {
            if (!post) return;
            try {
                await commentPostForLens(currentProfile.profileId, post.postId, chars, images, video);
                enqueueSnackbar(t`Replied on Lens`, {
                    variant: 'success',
                });
                ComposeModalRef.close();
            } catch {
                enqueueSnackbar(t`Failed to relay on Lens. @${currentProfile.handle}`, {
                    variant: 'error',
                });
            }
        } else if (type === 'quote') {
            if (!post) return;
            try {
                await quotePostForLens(currentProfile.profileId, post.postId, chars, images, video);
                enqueueSnackbar(t`Posted on Lens`, {
                    variant: 'success',
                });
                ComposeModalRef.close();
            } catch {
                enqueueSnackbar(t`Failed to quote on Lens. @${currentProfile.handle}`, {
                    variant: 'error',
                });
            }
        }
    }, [chars, currentProfile?.handle, currentProfile?.profileId, enqueueSnackbar, images, post, type, video]);
}
