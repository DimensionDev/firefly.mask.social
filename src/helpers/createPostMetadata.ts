import { image, MediaImageMimeType, MediaVideoMimeType, textOnly, video } from '@lens-protocol/metadata';
import { t } from '@lingui/macro';
import { v4 as uuid } from 'uuid';

import { getUserLocale } from '@/helpers/getUserLocale.js';
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

export function createPayloadAttachments(images: MediaObject[], video: MediaObject | null): Attachments | undefined {
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

export function createPostMetadata(baseMetadata: BaseMetadata, attachments?: Attachments) {
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
