import { t } from '@lingui/macro';
import { useCallback } from 'react';

import { commentPostForLens, publishPostForLens, quotePostForLens } from '@/helpers/publishPostForLens.js';
import { useCustomSnackbar } from '@/hooks/useCustomSnackbar.js';
import { uploadFileToIPFS } from '@/services/uploadToIPFS.js';
import { useComposeStateStore } from '@/store/useComposeStore.js';
import { useLensStateStore } from '@/store/useLensStore.js';
import type { MediaObject } from '@/types/index.js';

export function useSendLens() {
    const currentProfile = useLensStateStore.use.currentProfile();
    const { type, post, chars, images, updateImages, video, updateVideo, lensPostId, updateLensPostId } =
        useComposeStateStore();
    const enqueueSnackbar = useCustomSnackbar();

    return useCallback(async () => {
        if (!currentProfile?.profileId || lensPostId) return;
        const uploadedImages = await Promise.all(
            images.map(async (media) => {
                if (media.ipfs) return media;
                const response = await uploadFileToIPFS(media.file);
                if (response) {
                    const patchedMedia: MediaObject = {
                        ...media,
                        ipfs: response,
                    };
                    updateImages((originImages) => {
                        return originImages.map((x) => (x.file === media.file ? { ...x, ipfs: response } : x));
                    });
                    // We only care about ipfs for Lens
                    return patchedMedia;
                } else {
                    throw new Error(t`Failed to upload image to IPFS`);
                }
            }),
        );
        let uploadedVideo = video;
        if (video?.file && !video.ipfs) {
            const response = await uploadFileToIPFS(video.file);
            if (response) {
                uploadedVideo = {
                    ...video,
                    ipfs: response,
                };
                updateVideo(uploadedVideo);
            } else {
                throw new Error(t`Failed to upload image to IPFS`);
            }
        }

        if (type === 'compose') {
            try {
                const published = await publishPostForLens(
                    currentProfile.profileId,
                    chars,
                    uploadedImages,
                    uploadedVideo,
                );
                enqueueSnackbar(t`Posted on Lens`, {
                    variant: 'success',
                });
                updateLensPostId(published.postId);
            } catch {
                enqueueSnackbar(t`Failed to post on Lens`, {
                    variant: 'error',
                });
            }
        } else if (type === 'reply') {
            if (!post) return;
            try {
                await commentPostForLens(currentProfile.profileId, post.postId, chars, uploadedImages, uploadedVideo);
                enqueueSnackbar(t`Replied on Lens`, {
                    variant: 'success',
                });
            } catch {
                enqueueSnackbar(t`Failed to relay on Lens. @${currentProfile.handle}`, {
                    variant: 'error',
                });
            }
        } else if (type === 'quote') {
            if (!post) return;
            try {
                await quotePostForLens(currentProfile.profileId, post.postId, chars, uploadedImages, uploadedVideo);
                enqueueSnackbar(t`Posted on Lens`, {
                    variant: 'success',
                });
            } catch {
                enqueueSnackbar(t`Failed to quote on Lens. @${currentProfile.handle}`, {
                    variant: 'error',
                });
            }
        }
    }, [
        chars,
        currentProfile?.handle,
        currentProfile?.profileId,
        enqueueSnackbar,
        images,
        lensPostId,
        post,
        type,
        updateImages,
        updateLensPostId,
        updateVideo,
        video,
    ]);
}
