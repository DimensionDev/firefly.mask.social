import { SocialPlatform } from '@/constants/enum.js';
import { SITE_URL } from '@/constants/index.js';
import { createPayloadAttachments, createPostMetadata } from '@/helpers/createPostMetadata.js';
import { LensSocialMediaProvider } from '@/providers/lens/SocialMedia.js';
import { uploadToArweave } from '@/services/uploadToArweave.js';
import type { MediaObject } from '@/types/index.js';

export async function publishPostForLens(
    profileId: string,
    characters: string,
    images: MediaObject[],
    video: MediaObject | null,
) {
    const profile = await LensSocialMediaProvider.getProfileById(profileId);

    const title = `Post by #${profile.handle}`;
    const metadata = createPostMetadata(
        {
            title,
            content: characters,
            marketplace: {
                name: title,
                description: characters,
                external_url: SITE_URL,
            },
        },
        createPayloadAttachments(images, video),
    );
    const arweaveId = await uploadToArweave(metadata);
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
    characters: string,
    images: MediaObject[],
    video: MediaObject | null,
) {
    const profile = await LensSocialMediaProvider.getProfileById(profileId);

    const title = `Post by #${profile.handle}`;
    const metadata = createPostMetadata(
        {
            title,
            content: characters,
            marketplace: {
                name: title,
                description: characters,
                external_url: SITE_URL,
            },
        },
        createPayloadAttachments(images, video),
    );
    const arweaveId = await uploadToArweave(metadata);
    await LensSocialMediaProvider.commentPost(postId, `ar://${arweaveId}`, profile.signless);
}

export async function quotePostForLens(
    profileId: string,
    postId: string,
    characters: string,
    images: MediaObject[],
    video: MediaObject | null,
) {
    const profile = await LensSocialMediaProvider.getProfileById(profileId);

    const title = `Post by #${profile.handle}`;
    const metadata = createPostMetadata(
        {
            title,
            content: characters,
            marketplace: {
                name: title,
                description: characters,
                external_url: SITE_URL,
            },
        },
        createPayloadAttachments(images, video),
    );
    const arweaveId = await uploadToArweave(metadata);
    const post = await LensSocialMediaProvider.quotePost(postId, `ar://${arweaveId}`, profile.signless);
    return post;
}
