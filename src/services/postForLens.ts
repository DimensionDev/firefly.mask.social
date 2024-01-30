import { image, MediaImageMimeType, MediaVideoMimeType, textOnly, video } from '@lens-protocol/metadata';
import { t } from '@lingui/macro';
import { v4 as uuid } from 'uuid';

import { SocialPlatform } from '@/constants/enum.js';
import { SITE_URL } from '@/constants/index.js';
import { getUserLocale } from '@/helpers/getUserLocale.js';
import { LensSocialMediaProvider } from '@/providers/lens/SocialMedia.js';
import { uploadToArweave } from '@/services/uploadToArweave.js';
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
        appId: 'Hey',
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

export async function publishPostForLens(
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

export async function commentPostForLens(
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
    return LensSocialMediaProvider.commentPost(postId, `ar://${arweaveId}`, profile.signless);
}

export async function quotePostForLens(
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
    const post = await LensSocialMediaProvider.quotePost(postId, `ar://${arweaveId}`, profile.signless);
    return post;
}
