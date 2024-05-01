import { image, MediaImageMimeType, MediaVideoMimeType, textOnly, video } from '@lens-protocol/metadata';
import { t } from '@lingui/macro';
import { first } from 'lodash-es';
import { v4 as uuid } from 'uuid';

import { SocialPlatform } from '@/constants/enum.js';
import { SITE_URL } from '@/constants/index.js';
import { readChars } from '@/helpers/chars.js';
import { createDummyPost } from '@/helpers/createDummyPost.js';
import { getUserLocale } from '@/helpers/getUserLocale.js';
import { resolveSourceName } from '@/helpers/resolveSourceName.js';
import { LensSocialMediaProvider } from '@/providers/lens/SocialMedia.js';
import { createPostTo } from '@/services/createPostTo.js';
import { uploadToArweave } from '@/services/uploadToArweave.js';
import { uploadFileToIPFS } from '@/services/uploadToIPFS.js';
import { type CompositePost } from '@/store/useComposeStore.js';
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
    return LensSocialMediaProvider.commentPost(
        postId,
        createDummyPost(SocialPlatform.Lens, `ar://${arweaveId}`),
        profile.signless,
    );
}

async function quotePostForLens(
    profileId: string,
    postId: string,
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
    const post = await LensSocialMediaProvider.quotePost(
        postId,
        createDummyPost(SocialPlatform.Lens, `ar://${arweaveId}`),
        profile.signless,
    );
    return post;
}

export async function postToLens(type: ComposeType, compositePost: CompositePost) {
    const { chars, images, postId, parentPost, video } = compositePost;

    const lensPostId = postId.Lens;
    const lensParentPost = parentPost.Lens;
    const sourceName = resolveSourceName(SocialPlatform.Lens);

    // already posted to lens
    if (lensPostId) throw new Error(t`Already posted on ${sourceName}.`);

    // login required
    const { currentProfile } = useLensStateStore.getState();
    if (!currentProfile?.profileId) throw new Error(t`Login required to post on ${sourceName}.`);

    const postTo = createPostTo(SocialPlatform.Lens, {
        uploadImages() {
            return Promise.all(
                images.map(async (media) => {
                    if (media.ipfs) return media;
                    return {
                        ...media,
                        ipfs: await uploadFileToIPFS(media.file),
                    };
                }),
            );
        },
        uploadVideos() {
            return Promise.all(
                (video?.file ? [video] : []).map(async (media) => {
                    if (media?.ipfs) return media;
                    return {
                        ...media,
                        ipfs: await uploadFileToIPFS(media.file),
                    };
                }),
            );
        },
        compose(images, videos) {
            const video = first(videos) ?? null;
            return publishPostForLens(currentProfile.profileId, readChars(chars), images, video);
        },
        reply(images, videos) {
            if (!lensParentPost) throw new Error(t`No parent post found.`);
            const video = first(videos) ?? null;
            return commentPostForLens(currentProfile.profileId, lensParentPost.postId, readChars(chars), images, video);
        },
        quote(images, videos) {
            if (!lensParentPost) throw new Error(t`No parent post found.`);
            const video = first(videos) ?? null;
            return quotePostForLens(currentProfile.profileId, lensParentPost.postId, readChars(chars), images, video);
        },
    });

    return postTo(type, compositePost);
}
