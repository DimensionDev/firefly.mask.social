import { image, MediaImageMimeType, MediaVideoMimeType, textOnly, video } from '@lens-protocol/metadata';
import { v4 as uuid } from 'uuid';

import getUserLocale from '@/helpers/getUserLocale.js';

interface IBaseMetadata {
    title: string;
    content: string;
    marketplace: {
        name: string;
        description: string;
        external_url: string;
    };
}

interface IAttachments {
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

export default function getPostMetaData(baseMetadata: IBaseMetadata, attachments?: IAttachments) {
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

export type GetPostMetaData = ReturnType<typeof getPostMetaData>;
