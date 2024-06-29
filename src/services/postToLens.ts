import { image, link, MediaImageMimeType, MediaVideoMimeType, textOnly, video } from '@lens-protocol/metadata';
import { t } from '@lingui/macro';
import { first } from 'lodash-es';
import { v4 as uuid } from 'uuid';

import { Source } from '@/constants/enum.js';
import { SITE_URL } from '@/constants/index.js';
import { readChars } from '@/helpers/chars.js';
import { createDummyPost } from '@/helpers/createDummyPost.js';
import { getPollFrameUrl } from '@/helpers/getPollFrameUrl.js';
import { getUserLocale } from '@/helpers/getUserLocale.js';
import { createIPFSMediaObject, resolveMediaObjectUrl } from '@/helpers/resolveMediaObjectUrl.js';
import { resolveSourceName } from '@/helpers/resolveSourceName.js';
import { LensPollProvider } from '@/providers/lens/Poll.js';
import { LensSocialMediaProvider } from '@/providers/lens/SocialMedia.js';
import type { Poll } from '@/providers/types/Poll.js';
import { createPostTo } from '@/services/createPostTo.js';
import { uploadToArweave } from '@/services/uploadToArweave.js';
import { uploadFileToIPFS } from '@/services/uploadToIPFS.js';
import { type CompositePost } from '@/store/useComposeStore.js';
import { useLensStateStore } from '@/store/useProfileStore.js';
import { type ComposeType, type MediaObject, MediaSource } from '@/types/compose.js';

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
    if (
        images.some((image) => !resolveMediaObjectUrl(image, [MediaSource.IPFS])) ||
        !resolveMediaObjectUrl(video, [MediaSource.IPFS])
    ) {
        throw new Error(t`There are images or videos that were not uploaded successfully.`);
    }

    const imagesWithIPFS = images as Array<Required<MediaObject>>;
    const videoWithIPFS = video as Required<MediaObject> | null;

    return imagesWithIPFS.length > 0 || !!videoWithIPFS
        ? {
              attachments: videoWithIPFS
                  ? [
                        {
                            item: resolveMediaObjectUrl(videoWithIPFS, [MediaSource.IPFS]),
                            type: videoWithIPFS.mimeType,
                            cover: resolveMediaObjectUrl(videoWithIPFS, [MediaSource.IPFS]),
                        },
                    ]
                  : imagesWithIPFS.map((image) => ({
                        item: resolveMediaObjectUrl(image, [MediaSource.IPFS]),
                        type: image.mimeType,
                        cover: resolveMediaObjectUrl(imagesWithIPFS[0], [MediaSource.IPFS]),
                    })),
              ...(videoWithIPFS
                  ? {
                        video: {
                            item: resolveMediaObjectUrl(videoWithIPFS, [MediaSource.IPFS]),
                            type: videoWithIPFS.mimeType,
                        },
                    }
                  : {
                        image: {
                            item: resolveMediaObjectUrl(imagesWithIPFS[0], [MediaSource.IPFS]),
                            type: imagesWithIPFS[0].mimeType,
                        },
                    }),
          }
        : undefined;
}

function createPayloadSharingLink(polls: Poll[] | undefined): string | undefined {
    if (!polls?.length) return;
    return getPollFrameUrl(polls[0].id, Source.Lens);
}

function createPostMetadata(baseMetadata: BaseMetadata, attachments?: Attachments, sharingLink?: string) {
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

    if (sharingLink) {
        return link({
            ...baseMetadata,
            ...localBaseMetadata,
            sharingLink,
        });
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
        createPayloadSharingLink(polls),
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
        createPayloadSharingLink(polls),
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
        createPayloadSharingLink(polls),
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
                    if (resolveMediaObjectUrl(media, [MediaSource.IPFS, MediaSource.Giphy])) return media;
                    return createIPFSMediaObject(await uploadFileToIPFS(media.file), media);
                }),
            );
        },
        uploadVideos() {
            return Promise.all(
                (video?.file ? [video] : []).map(async (media) => {
                    if (resolveMediaObjectUrl(media, [MediaSource.IPFS])) return media;
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
