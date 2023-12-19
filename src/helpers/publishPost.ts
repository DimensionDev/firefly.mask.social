import { SocialPlatform } from '@/constants/enum.js';
import { SITE_URL } from '@/constants/index.js';
import { getPostMetaData } from '@/helpers/getPostMetaData.js';
import { LensSocialMediaProvider } from '@/providers/lens/SocialMedia.js';
import { uploadToArweave } from '@/services/uploadToArweave.js';
import type { MediaObject, MediaObject_WithIPFS } from '@/types/index.js';

export async function publishPostForLens(
    profileId: string,
    characters: string,
    images: MediaObject[],
    video: MediaObject | null,
) {
    const lens = LensSocialMediaProvider;
    const profile = await lens.getProfileById(profileId);

    const filteredImages = images.filter((image) => !!image.ipfs) as MediaObject_WithIPFS[];
    const filteredVideo = video && !!video.ipfs ? (video as MediaObject_WithIPFS) : null;

    const title = `Post by #${profile.handle}`;
    const metadata = getPostMetaData(
        {
            title,
            content: characters,
            marketplace: {
                name: title,
                description: characters,
                external_url: SITE_URL,
            },
        },
        filteredImages.length > 0 || !!filteredVideo
            ? {
                  attachments: filteredVideo
                      ? [
                            {
                                item: filteredVideo.ipfs.uri,
                                type: filteredVideo.ipfs.mimeType,
                                cover: filteredVideo.ipfs.uri,
                            },
                        ]
                      : filteredImages.map((image) => ({
                            item: image.ipfs.uri,
                            type: image.ipfs.mimeType,
                            cover: filteredImages[0].ipfs.uri,
                        })),
                  ...(filteredVideo
                      ? {
                            filteredVideo: {
                                item: filteredVideo.ipfs.uri,
                                type: filteredVideo.ipfs.mimeType,
                            },
                        }
                      : {
                            image: {
                                item: filteredImages[0].ipfs.uri,
                                type: filteredImages[0].ipfs.mimeType,
                            },
                        }),
              }
            : undefined,
    );
    const arweaveId = await uploadToArweave(metadata);
    const post = await lens.publishPost({
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
    characters: string,
    images: MediaObject[],
    video: MediaObject | null,
) {
    const lens = LensSocialMediaProvider;
    const profile = await lens.getProfileById(profileId);

    const filteredImages = images.filter((image) => !!image.ipfs) as MediaObject_WithIPFS[];
    const filteredVideo = video && !!video.ipfs ? (video as MediaObject_WithIPFS) : null;

    const title = `Post by #${profile.handle}`;
    const metadata = getPostMetaData(
        {
            title,
            content: characters,
            marketplace: {
                name: title,
                description: characters,
                external_url: SITE_URL,
            },
        },
        filteredImages.length > 0 || !!filteredVideo
            ? {
                  attachments: filteredVideo
                      ? [
                            {
                                item: filteredVideo.ipfs.uri,
                                type: filteredVideo.ipfs.mimeType,
                                cover: filteredVideo.ipfs.uri,
                            },
                        ]
                      : filteredImages.map((image) => ({
                            item: image.ipfs.uri,
                            type: image.ipfs.mimeType,
                            cover: filteredImages[0].ipfs.uri,
                        })),
                  ...(filteredVideo
                      ? {
                            filteredVideo: {
                                item: filteredVideo.ipfs.uri,
                                type: filteredVideo.ipfs.mimeType,
                            },
                        }
                      : {
                            image: {
                                item: filteredImages[0].ipfs.uri,
                                type: filteredImages[0].ipfs.mimeType,
                            },
                        }),
              }
            : undefined,
    );
    const arweaveId = await uploadToArweave(metadata);
    await lens.commentPost(postId, `ar://${arweaveId}`, profile.signless);
}

export async function quotePostForLens(
    profileId: string,
    postId: string,
    characters: string,
    images: MediaObject[],
    video: MediaObject | null,
) {
    const lens = LensSocialMediaProvider;
    const profile = await lens.getProfileById(profileId);

    const filteredImages = images.filter((image) => !!image.ipfs) as MediaObject_WithIPFS[];
    const filteredVideo = video && !!video.ipfs ? (video as MediaObject_WithIPFS) : null;

    const title = `Post by #${profile.handle}`;
    const metadata = getPostMetaData(
        {
            title,
            content: characters,
            marketplace: {
                name: title,
                description: characters,
                external_url: SITE_URL,
            },
        },
        filteredImages.length > 0 || !!filteredVideo
            ? {
                  attachments: filteredVideo
                      ? [
                            {
                                item: filteredVideo.ipfs.uri,
                                type: filteredVideo.ipfs.mimeType,
                                cover: filteredVideo.ipfs.uri,
                            },
                        ]
                      : filteredImages.map((image) => ({
                            item: image.ipfs.uri,
                            type: image.ipfs.mimeType,
                            cover: filteredImages[0].ipfs.uri,
                        })),
                  ...(filteredVideo
                      ? {
                            filteredVideo: {
                                item: filteredVideo.ipfs.uri,
                                type: filteredVideo.ipfs.mimeType,
                            },
                        }
                      : {
                            image: {
                                item: filteredImages[0].ipfs.uri,
                                type: filteredImages[0].ipfs.mimeType,
                            },
                        }),
              }
            : undefined,
    );
    const arweaveId = await uploadToArweave(metadata);
    const post = await lens.quotePost(postId, `ar://${arweaveId}`, profile.signless);
    return post;
}
