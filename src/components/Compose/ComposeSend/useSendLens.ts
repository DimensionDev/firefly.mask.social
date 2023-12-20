import { t } from '@lingui/macro';
import { useCallback } from 'react';

import { commentPostForLens, publishPostForLens, quotePostForLens } from '@/helpers/publishPost.js';
import { useCustomSnackbar } from '@/hooks/useCustomSnackbar.js';
import { ComposeModalRef } from '@/modals/controls.js';
import { uploadFileToIPFS } from '@/services/uploadToIPFS.js';
import { useComposeStateStore } from '@/store/useComposeStore.js';
import { useLensStateStore } from '@/store/useLensStore.js';
import type { MediaObject } from '@/types/index.js';

export function useSendLens() {
    const currentProfile = useLensStateStore.use.currentProfile();
    const { type, post, chars, images, updateImageByIndex, video, updateVideo, updateLensPostId } =
        useComposeStateStore();
    const enqueueSnackbar = useCustomSnackbar();

    return useCallback(async () => {
        if (!currentProfile?.profileId) return;
        const uploadedImages = await Promise.all(
            images.map(async (media, index) => {
                if (media.ipfs) return media;
                const response = await uploadFileToIPFS(media.file);
                if (response) {
                    const patchedMedia: MediaObject = {
                        ...media,
                        ipfs: response,
                    };
                    // TODO race conditions
                    updateImageByIndex(index, patchedMedia);
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

        let publishedId: string | undefined = undefined;
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
                publishedId = published.postId;
                ComposeModalRef.close();
            } catch {
                enqueueSnackbar(t`Failed to post on Lens`, {
                    variant: 'error',
                });
            }
        } else if (type === 'reply') {
            if (!post) return;
            try {
                publishedId = await commentPostForLens(
                    currentProfile.profileId,
                    post.postId,
                    chars,
                    uploadedImages,
                    uploadedVideo,
                );
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
                const quoted = await quotePostForLens(
                    currentProfile.profileId,
                    post.postId,
                    chars,
                    uploadedImages,
                    uploadedVideo,
                );
                publishedId = quoted.postId;
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
        if (publishedId) {
            updateLensPostId(publishedId);
        }
    }, [
        chars,
        currentProfile?.handle,
        currentProfile?.profileId,
        enqueueSnackbar,
        images,
        post,
        type,
        updateImageByIndex,
        updateLensPostId,
        updateVideo,
        video,
    ]);
}
