import { t } from '@lingui/macro';
import { useCallback } from 'react';

import { queryClient } from '@/configs/queryClient.js';
import { readChars } from '@/helpers/readChars.js';
import { useCustomSnackbar } from '@/hooks/useCustomSnackbar.js';
import { commentPostForLens, publishPostForLens, quotePostForLens } from '@/services/postForLens.js';
import { uploadFileToIPFS } from '@/services/uploadToIPFS.js';
import { useComposeStateStore } from '@/store/useComposeStore.js';
import { useLensStateStore } from '@/store/useProfileStore.js';
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
                try {
                    if (media.ipfs) return media;
                    const ipfs = await uploadFileToIPFS(media.file);
                    const patchedMedia: MediaObject = {
                        ...media,
                        ipfs,
                    };
                    updateImages((originImages) => {
                        return originImages.map((x) => (x.file === media.file ? patchedMedia : x));
                    });
                    // We only care about ipfs for Lens
                    return patchedMedia;
                } catch (err) {
                    const message = t`Failed to upload image to IPFS.`;
                    enqueueSnackbar(message, { variant: 'error' });
                    throw new Error(message);
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
                const message = t`Failed to upload video to IPFS.`;
                enqueueSnackbar(message, { variant: 'error' });
                throw new Error(message);
            }
        }

        if (type === 'compose') {
            try {
                const published = await publishPostForLens(
                    currentProfile.profileId,
                    readChars(chars),
                    uploadedImages,
                    uploadedVideo,
                );
                enqueueSnackbar(t`Posted on Lens`, {
                    variant: 'success',
                });
                updateLensPostId(published.postId);
            } catch (error) {
                enqueueSnackbar(t`Failed to post on Lens.`, {
                    variant: 'error',
                });
                throw error;
            }
        } else if (type === 'reply') {
            try {
                if (!post) throw new Error('No post found.');
                const comment = await commentPostForLens(
                    currentProfile.profileId,
                    post.postId,
                    readChars(chars),
                    uploadedImages,
                    uploadedVideo,
                );
                enqueueSnackbar(t`Replied on Lens`, {
                    variant: 'success',
                });
                updateLensPostId(comment);

                queryClient.invalidateQueries({ queryKey: [post.source, 'post-detail', post.postId] });
                queryClient.invalidateQueries({ queryKey: ['post-detail', 'comments', post.source, post.postId] });
            } catch (error) {
                enqueueSnackbar(t`Failed to relay post on Lens.`, {
                    variant: 'error',
                });
                throw error;
            }
        } else if (type === 'quote') {
            try {
                if (!post) throw new Error('No post found.');
                const quote = await quotePostForLens(
                    currentProfile.profileId,
                    post.postId,
                    readChars(chars),
                    uploadedImages,
                    uploadedVideo,
                );
                enqueueSnackbar(t`Posted on Lens`, {
                    variant: 'success',
                });

                updateLensPostId(quote.postId);
            } catch (error) {
                enqueueSnackbar(t`Failed to quote post on Lens.`, {
                    variant: 'error',
                });
                throw error;
            }
        }
    }, [
        chars,
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
