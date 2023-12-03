import type { IImage } from '@/components/Compose/index.js';
import { SocialPlatform } from '@/constants/enum.js';
import { getPostMetaData } from '@/helpers/getPostMetaData.js';
import { LensSocialMedia } from '@/providers/lens/SocialMedia.js';
import uploadToArweave from '@/services/uploadToArweave.js';

export async function publishPostForLens(profileId: string, characters: string, images: IImage[]) {
    const lens = new LensSocialMedia();
    const profile = await lens.getProfileById(profileId);

    const title = `Post by #${profile.handle}`;
    const metadata = getPostMetaData(
        {
            title,
            content: characters,
            marketplace: {
                name: title,
                description: characters,
                external_url: 'https://mask.social',
            },
        },
        images.length > 0
            ? {
                  image: {
                      item: images[0].ipfs.uri,
                      type: images[0].ipfs.mimeType,
                  },
                  attachments: images.map((image) => ({
                      item: image.ipfs.uri,
                      type: image.ipfs.mimeType,
                      cover: images[0].ipfs.uri,
                  })),
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

export async function commentPostForLens(profileId: string, postId: string, characters: string, images: IImage[]) {
    const lens = new LensSocialMedia();
    const profile = await lens.getProfileById(profileId);

    const title = `Post by #${profile.handle}`;
    const metadata = getPostMetaData(
        {
            title,
            content: characters,
            marketplace: {
                name: title,
                description: characters,
                external_url: 'https://mask.social',
            },
        },
        images.length > 0
            ? {
                  image: {
                      item: images[0].ipfs.uri,
                      type: images[0].ipfs.mimeType,
                  },
                  attachments: images.map((image) => ({
                      item: image.ipfs.uri,
                      type: image.ipfs.mimeType,
                      cover: images[0].ipfs.uri,
                  })),
              }
            : undefined,
    );
    const arweaveId = await uploadToArweave(metadata);
    await lens.commentPost(postId, `ar://${arweaveId}`, profile.signless);
}

export async function quotePostForLens(profileId: string, postId: string, characters: string, images: IImage[]) {
    const lens = new LensSocialMedia();
    const profile = await lens.getProfileById(profileId);

    const title = `Post by #${profile.handle}`;
    const metadata = getPostMetaData(
        {
            title,
            content: characters,
            marketplace: {
                name: title,
                description: characters,
                external_url: 'https://mask.social',
            },
        },
        images.length > 0
            ? {
                  image: {
                      item: images[0].ipfs.uri,
                      type: images[0].ipfs.mimeType,
                  },
                  attachments: images.map((image) => ({
                      item: image.ipfs.uri,
                      type: image.ipfs.mimeType,
                      cover: images[0].ipfs.uri,
                  })),
              }
            : undefined,
    );
    const arweaveId = await uploadToArweave(metadata);
    const post = await lens.quotePost(postId, `ar://${arweaveId}`, profile.signless);
    return post;
}
