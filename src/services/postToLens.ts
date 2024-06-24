import {
    image,
    MediaImageMimeType,
    MediaVideoMimeType,
    type MetadataAttribute,
    MetadataAttributeType,
    textOnly,
    type TextOnlyOptions,
    video,
} from '@lens-protocol/metadata';
import { t } from '@lingui/macro';
import { first } from 'lodash-es';
import { v4 as uuid } from 'uuid';

import { Source } from '@/constants/enum.js';
import { SITE_URL } from '@/constants/index.js';
import { readChars } from '@/helpers/chars.js';
import { createDummyPost } from '@/helpers/createDummyPost.js';
import { getUserLocale } from '@/helpers/getUserLocale.js';
import { createIPFSMediaObject } from '@/helpers/resolveMediaURL.js';
import { resolveSourceName } from '@/helpers/resolveSourceName.js';
import { LensPollProvider } from '@/providers/lens/Poll.js';
import { LensSocialMediaProvider } from '@/providers/lens/SocialMedia.js';
import { LensMetadataAttributeKey } from '@/providers/types/Lens.js';
import type { Poll } from '@/providers/types/Poll.js';
import { createPostTo } from '@/services/createPostTo.js';
import { uploadToArweave } from '@/services/uploadToArweave.js';
import { uploadFileToIPFS } from '@/services/uploadToIPFS.js';
import { type CompositePost } from '@/store/useComposeStore.js';
import { useLensStateStore } from '@/store/useProfileStore.js';
import type { ComposeType } from '@/types/compose.js';
import { type MediaObject, MediaObjectSource } from '@/types/index.js';

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
    if (images.some((image) => image.source === MediaObjectSource.local) || (video?.source === MediaObjectSource.local)) {
        throw new Error(t`There are images or videos that were not uploaded successfully.`);
    }

    const imagesWithIPFS = images as Array<Required<MediaObject>>;
    const videoWithIPFS = video as Required<MediaObject> | null;

    return imagesWithIPFS.length > 0 || !!videoWithIPFS
        ? {
              attachments: videoWithIPFS
                  ? [
                        {
                            item: videoWithIPFS.url,
                            type: videoWithIPFS.mimeType,
                            cover: videoWithIPFS.url,
                        },
                    ]
                  : imagesWithIPFS.map((image) => ({
                        item: image.url,
                        type: image.mimeType,
                        cover: imagesWithIPFS[0].url,
                    })),
              ...(videoWithIPFS
                  ? {
                        video: {
                            item: videoWithIPFS.url,
                            type: videoWithIPFS.mimeType,
                        },
                    }
                  : {
                        image: {
                            item: imagesWithIPFS[0].url,
                            type: imagesWithIPFS[0].mimeType,
                        },
                    }),
          }
        : undefined;
}

function createPayloadAttributes(polls: Poll[] | undefined): MetadataAttribute[] | undefined {
    if (!polls?.length) return;
    return polls.map((poll) => ({
        key: LensMetadataAttributeKey.Poll,
        type: MetadataAttributeType.STRING,
        value: poll.id,
    }));
}

function createPostMetadata(baseMetadata: BaseMetadata, attachments?: Attachments, attributes?: MetadataAttribute[]) {
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

    const textOnlyOptions: TextOnlyOptions = {
        ...baseMetadata,
        ...localBaseMetadata,
    };

    if (attributes) {
        textOnlyOptions.attributes = attributes;
    }

    return textOnly(textOnlyOptions);
}

export type GetPostMetaData = ReturnType<typeof createPostMetadata>;

async function publishPostForLens(
    profileId: string,
    content: string,
    images: MediaObject[],
    video: MediaObject | null,
    polls?: Poll[],
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
        createPayloadAttributes(polls),
    );
    const tokenRes = await LensSocialMediaProvider.getAccessToken();
    const token = tokenRes.unwrap();
    const arweaveId = await uploadToArweave(metadata, token);
    const publicationId = await LensSocialMediaProvider.publishPost({
        publicationId: '',
        postId: metadata.lens.id,
        author: profile,
        metadata: {
            locale: metadata.lens.locale,
            contentURI: `ar://${arweaveId}`,
            content: null,
        },
        source: Source.Lens,
    });
    return publicationId;
}

async function commentPostForLens(
    profileId: string,
    postId: string,
    content: string,
    images: MediaObject[],
    video: MediaObject | null,
    polls?: Poll[],
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
        createPayloadAttributes(polls),
    );
    const tokenRes = await LensSocialMediaProvider.getAccessToken();
    const token = tokenRes.unwrap();
    const arweaveId = await uploadToArweave(metadata, token);
    return LensSocialMediaProvider.commentPost(
        postId,
        createDummyPost(Source.Lens, `ar://${arweaveId}`),
        profile.signless,
    );
}

async function quotePostForLens(
    profileId: string,
    postId: string,
    content: string,
    images: MediaObject[],
    video: MediaObject | null,
    polls?: Poll[],
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
        createPayloadAttributes(polls),
    );
    const tokenRes = await LensSocialMediaProvider.getAccessToken();
    const token = tokenRes.unwrap();
    const arweaveId = await uploadToArweave(metadata, token);
    const post = await LensSocialMediaProvider.quotePost(
        postId,
        createDummyPost(Source.Lens, `ar://${arweaveId}`),
        profile.signless,
    );
    return post;
}

export async function postToLens(type: ComposeType, compositePost: CompositePost) {
    const { chars, images, postId, parentPost, video, poll } = compositePost;

    const lensPostId = postId.Lens;
    const lensParentPost = parentPost.Lens;
    const sourceName = resolveSourceName(Source.Lens);

    // already posted to lens
    if (lensPostId) throw new Error(t`Already posted on ${sourceName}.`);

    // login required
    const { currentProfile } = useLensStateStore.getState();
    if (!currentProfile?.profileId) throw new Error(t`Login required to post on ${sourceName}.`);

    const postTo = createPostTo(Source.Lens, {
        uploadImages() {
            return Promise.all(
                images.map(async (media) => {
                    if ([MediaObjectSource.ipfs, MediaObjectSource.giphy].includes(media.source)) return media;
                    return createIPFSMediaObject(await uploadFileToIPFS(media.file), media);
                }),
            );
        },
        uploadVideos() {
            return Promise.all(
                (video?.file ? [video] : []).map(async (media) => {
                    if (media.source === MediaObjectSource.ipfs) return media;
                    return createIPFSMediaObject(await uploadFileToIPFS(media.file), media);
                }),
            );
        },
        uploadPolls: async () => {
            if (!poll) return [];
            const pollStub = await LensPollProvider.createPoll(poll, readChars(chars, 'both', Source.Lens));
            return [pollStub];
        },
        compose(images, videos, polls) {
            const video = first(videos) ?? null;
            return publishPostForLens(
                currentProfile.profileId,
                readChars(chars, 'both', Source.Lens),
                images,
                video,
                polls,
            );
        },
        reply(images, videos, polls) {
            if (!lensParentPost) throw new Error(t`No parent post found.`);
            const video = first(videos) ?? null;
            return commentPostForLens(
                currentProfile.profileId,
                lensParentPost.postId,
                readChars(chars, 'both', Source.Lens),
                images,
                video,
                polls,
            );
        },
        quote(images, videos, polls) {
            if (!lensParentPost) throw new Error(t`No parent post found.`);
            const video = first(videos) ?? null;
            return quotePostForLens(
                currentProfile.profileId,
                lensParentPost.postId,
                readChars(chars, 'both', Source.Lens),
                images,
                video,
                polls,
            );
        },
    });

    return postTo(type, compositePost);
}
