import { image, MediaImageMimeType, MediaVideoMimeType, textOnly, video } from '@lens-protocol/metadata';
import { t } from '@lingui/macro';
import { safeUnreachable } from '@masknet/kit';
import { v4 as uuid } from 'uuid';

import { queryClient } from '@/configs/queryClient.js';
import { SocialPlatform } from '@/constants/enum.js';
import { SITE_URL } from '@/constants/index.js';
import { enqueueErrorMessage, enqueueSuccessMessage } from '@/helpers/enqueueMessage.js';
import { getUserLocale } from '@/helpers/getUserLocale.js';
import { readChars } from '@/helpers/readChars.js';
import { LensSocialMediaProvider } from '@/providers/lens/SocialMedia.js';
import { uploadToArweave } from '@/services/uploadToArweave.js';
import { uploadFileToIPFS } from '@/services/uploadToIPFS.js';
import { type CompositePost, useComposeStateStore } from '@/store/useComposeStore.js';
import { useLensStateStore } from '@/store/useProfileStore.js';
import type { ComposeType } from '@/types/compose.js';
import type { MediaObject } from '@/types/index.js';

interface BaseMetadata {
    title: string;
    content: string;
    marketplace: {
        name: string;
        description: string;
        external_url: string;
    };
}

interface Attachments {
    image?: {
        item: string;
        type: string;
    };
    video?: {
        item: string;
        type: string;
        duration?: number;
    };
    attachments: Array<{
        item: string;
        type: string;
        cover?: string;
    }>;
}

function createPayloadAttachments(images: MediaObject[], video: MediaObject | null): Attachments | undefined {
    if (images.some((image) => !image.ipfs) || (video && !video.ipfs)) {
        throw new Error(t`Missing IPFS hash for image or video.`);
    }

    const imagesWithIPFS = images as Array<Required<MediaObject>>;
    const videoWithIPFS = video as Required<MediaObject> | null;

    return imagesWithIPFS.length > 0 || !!videoWithIPFS
        ? {
              attachments: videoWithIPFS
                  ? [
                        {
                            item: videoWithIPFS.ipfs.uri,
                            type: videoWithIPFS.ipfs.mimeType,
                            cover: videoWithIPFS.ipfs.uri,
                        },
                    ]
                  : imagesWithIPFS.map((image) => ({
                        item: image.ipfs.uri,
                        type: image.ipfs.mimeType,
                        cover: imagesWithIPFS[0].ipfs.uri,
                    })),
              ...(videoWithIPFS
                  ? {
                        video: {
                            item: videoWithIPFS.ipfs.uri,
                            type: videoWithIPFS.ipfs.mimeType,
                        },
                    }
                  : {
                        image: {
                            item: imagesWithIPFS[0].ipfs.uri,
                            type: imagesWithIPFS[0].ipfs.mimeType,
                        },
                    }),
          }
        : undefined;
}

function createPostMetadata(baseMetadata: BaseMetadata, attachments?: Attachments) {
    const localBaseMetadata = {
        id: uuid(),
        locale: getUserLocale(),
        appId: 'firefly',
    };

    if (attachments) {
        if (attachments.image) {
            return image({
                ...baseMetadata,
                ...localBaseMetadata,
                image: {
                    item: attachments.image.item,
                    type: attachments.image.type as MediaImageMimeType,
                },
                attachments: attachments.attachments.map((attachment) => ({
                    item: attachment.item,
                    type: attachment.type as MediaImageMimeType,
                    cover: attachment.cover,
                })),
            });
        }

        if (attachments.video) {
            return video({
                ...baseMetadata,
                ...localBaseMetadata,
                video: {
                    item: attachments.video.item,
                    type: attachments.video.type as MediaVideoMimeType,
                    duration: attachments.video.duration,
                },
                attachments: attachments.attachments.map((attachment) => ({
                    item: attachment.item,
                    type: attachment.type as MediaImageMimeType,
                    cover: attachment.cover,
                })),
            });
        }
    }

    return textOnly({
        ...baseMetadata,
        ...localBaseMetadata,
    });
}

export type GetPostMetaData = ReturnType<typeof createPostMetadata>;

async function publishPostForLens(
    profileId: string,
    content: string,
    images: MediaObject[],
    video: MediaObject | null,
) {
    const profile = await LensSocialMediaProvider.getProfileById(profileId);

    const title = `Post by #${profile.handle}`;
    const metadata = createPostMetadata(
        {
            title,
            content,
            marketplace: {
                name: title,
                description: content,
                external_url: SITE_URL,
            },
        },
        createPayloadAttachments(images, video),
    );
    const tokenRes = await LensSocialMediaProvider.getAccessToken();
    const token = tokenRes.unwrap();
    const arweaveId = await uploadToArweave(metadata, token);
    const post = await LensSocialMediaProvider.publishPost({
        postId: metadata.lens.id,
        author: profile,
        metadata: {
            locale: metadata.lens.locale,
            contentURI: `ar://${arweaveId}`,
            content: null,
        },
        source: SocialPlatform.Lens,
    });
    return post;
}

async function commentPostForLens(
    profileId: string,
    postId: string,
    content: string,
    images: MediaObject[],
    video: MediaObject | null,
    onMomoka?: boolean,
) {
    const profile = await LensSocialMediaProvider.getProfileById(profileId);

    const title = `Post by #${profile.handle}`;
    const metadata = createPostMetadata(
        {
            title,
            content,
            marketplace: {
                name: title,
                description: content,
                external_url: SITE_URL,
            },
        },
        createPayloadAttachments(images, video),
    );
    const tokenRes = await LensSocialMediaProvider.getAccessToken();
    const token = tokenRes.unwrap();
    const arweaveId = await uploadToArweave(metadata, token);
    return LensSocialMediaProvider.commentPost(postId, `ar://${arweaveId}`, profile.signless, onMomoka);
}

async function quotePostForLens(
    profileId: string,
    postId: string,
    content: string,
    images: MediaObject[],
    video: MediaObject | null,
    onMomoka?: boolean,
) {
    const profile = await LensSocialMediaProvider.getProfileById(profileId);

    const title = `Post by #${profile.handle}`;
    const metadata = createPostMetadata(
        {
            title,
            content,
            marketplace: {
                name: title,
                description: content,
                external_url: SITE_URL,
            },
        },
        createPayloadAttachments(images, video),
    );
    const tokenRes = await LensSocialMediaProvider.getAccessToken();
    const token = tokenRes.unwrap();
    const arweaveId = await uploadToArweave(metadata, token);
    const post = await LensSocialMediaProvider.quotePost(postId, `ar://${arweaveId}`, profile.signless, onMomoka);
    return post;
}

export async function postToLens(type: ComposeType, compositePost: CompositePost) {
    const { chars, images, postId, parentPost, video } = compositePost;

    const lensPostId = postId.Lens;
    const lensParentPost = parentPost.Lens;

    // already posted to lens
    if (lensPostId) throw new Error(t`Already posted on Lens.`);

    // login required
    const { currentProfile } = useLensStateStore.getState();
    if (!currentProfile?.profileId) throw new Error(t`Login required to post on Lens.`);

    const { updatePostInThread } = useComposeStateStore.getState();

    const uploadedImages = await Promise.all(
        images.map(async (media) => {
            try {
                if (media.ipfs) return media;
                const ipfs = await uploadFileToIPFS(media.file);
                const patchedMedia: MediaObject = {
                    ...media,
                    ipfs,
                };
                updatePostInThread(compositePost.id, (x) => ({
                    ...x,
                    images: x.images.map((x) => (x.file === media.file ? patchedMedia : x)),
                }));
                // We only care about ipfs for Lens
                return patchedMedia;
            } catch (err) {
                const message = t`Failed to upload image to IPFS.`;
                enqueueErrorMessage(message);
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
            updatePostInThread(compositePost.id, (x) => ({
                ...x,
                video: uploadedVideo,
            }));
        } else {
            const message = t`Failed to upload video to IPFS.`;
            enqueueErrorMessage(message);
            throw new Error(message);
        }
    }

    if (type === 'compose') {
        try {
            const postId = await publishPostForLens(
                currentProfile.profileId,
                readChars(chars),
                uploadedImages,
                uploadedVideo,
            );
            enqueueSuccessMessage(t`Posted on Lens`);
            updatePostInThread(compositePost.id, (x) => ({
                ...x,
                postId: {
                    ...x.postId,
                    [SocialPlatform.Lens]: postId,
                },
            }));
            return postId;
        } catch (error) {
            enqueueErrorMessage(t`Failed to post on Lens.`);
            throw error;
        }
    } else if (type === 'reply') {
        try {
            if (!lensParentPost) throw new Error('No post found.');
            const commentId = await commentPostForLens(
                currentProfile.profileId,
                lensParentPost.postId,
                readChars(chars),
                uploadedImages,
                uploadedVideo,
                !!lensParentPost.momoka?.proof,
            );
            enqueueSuccessMessage(t`Replied on Lens`);
            updatePostInThread(compositePost.id, (x) => ({
                ...x,
                postId: {
                    ...x.postId,
                    [SocialPlatform.Lens]: commentId,
                },
            }));

            queryClient.invalidateQueries({ queryKey: [lensParentPost.source, 'post-detail', lensParentPost.postId] });
            queryClient.invalidateQueries({
                queryKey: ['post-detail', 'comments', lensParentPost.source, lensParentPost.postId],
            });

            return commentId;
        } catch (error) {
            enqueueErrorMessage(t`Failed to relay post on Lens.`);
            throw error;
        }
    } else if (type === 'quote') {
        try {
            if (!lensParentPost) throw new Error('No post found.');
            const postId = await quotePostForLens(
                currentProfile.profileId,
                lensParentPost.postId,
                readChars(chars),
                uploadedImages,
                uploadedVideo,
                !!lensParentPost.momoka?.proof,
            );
            enqueueSuccessMessage(t`Posted on Lens`);
            updatePostInThread(compositePost.id, (x) => ({
                ...x,
                postId: {
                    ...x.postId,
                    [SocialPlatform.Lens]: postId,
                },
            }));

            await queryClient.setQueryData([lensParentPost.source, 'post-detail', lensParentPost.postId], {
                ...lensParentPost,
                hasQuoted: true,
            });

            return postId;
        } catch (error) {
            enqueueErrorMessage(t`Failed to quote post on Lens.`);
            throw error;
        }
    } else {
        safeUnreachable(type);
        throw new Error(t`Invalid compose type.`);
    }
}
