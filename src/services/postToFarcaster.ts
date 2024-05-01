import { t } from '@lingui/macro';
import { uniqBy } from 'lodash-es';

import { SocialPlatform, SourceInURL } from '@/constants/enum.js';
import { readChars } from '@/helpers/chars.js';
import { resolveSourceName } from '@/helpers/resolveSourceName.js';
import { hasRpPayload } from '@/helpers/rpPayload.js';
import { FarcasterSocialMediaProvider } from '@/providers/farcaster/SocialMedia.js';
import { type Post, type PostType } from '@/providers/types/SocialMedia.js';
import { createPostTo } from '@/services/createPostTo.js';
import { uploadToS3 } from '@/services/uploadToS3.js';
import { type CompositePost } from '@/store/useComposeStore.js';
import { useFarcasterStateStore } from '@/store/useProfileStore.js';
import type { ComposeType } from '@/types/compose.js';
import type { MediaObject } from '@/types/index.js';

export async function postToFarcaster(type: ComposeType, compositePost: CompositePost) {
    const { chars, parentPost, images, frames, openGraphs, typedMessage, postId } = compositePost;

    const farcasterPostId = postId.Farcaster;
    const farcasterParentPost = parentPost.Farcaster;
    const sourceName = resolveSourceName(SocialPlatform.Farcaster);

    // already posted to lens
    if (farcasterPostId) throw new Error(t`Already posted on ${sourceName}.`);

    // login required
    const { currentProfile } = useFarcasterStateStore.getState();
    if (!currentProfile?.profileId) throw new Error(t`Login required to post on ${sourceName}.`);

    const composeDraft = (postType: PostType, images: MediaObject[]) => {
        const hasPayload = hasRpPayload(typedMessage);
        return {
            type: postType,
            postId: '',
            source: SocialPlatform.Farcaster,
            author: currentProfile,
            metadata: {
                locale: '',
                content: {
                    content: readChars(chars),
                },
            },
            mediaObjects: uniqBy(
                [
                    ...images.map((media) => ({ url: media.s3!, mimeType: media.file.type })),
                    ...frames.map((frame) => ({ title: frame.title, url: frame.url })),
                    ...openGraphs.map((openGraph) => ({ title: openGraph.title!, url: openGraph.url })),
                ],
                (x) => x.url.toLowerCase(),
            ),
            commentOn: type === 'reply' && farcasterParentPost ? farcasterParentPost : undefined,
            parentChannelKey:
                hasPayload && process.env.NEXT_PUBLIC_REDPACKET_CHANNEL_KEY
                    ? process.env.NEXT_PUBLIC_REDPACKET_CHANNEL_KEY
                    : undefined,
            parentChannelUrl:
                hasPayload && process.env.NEXT_PUBLIC_REDPACKET_CHANNEL_URL
                    ? process.env.NEXT_PUBLIC_REDPACKET_CHANNEL_URL
                    : undefined,
        } satisfies Post;
    };

    const postTo = createPostTo(SocialPlatform.Farcaster, {
        uploadImages: () => {
            return Promise.all(
                images.map(async (media) => {
                    if (media.s3) return media;
                    return {
                        ...media,
                        s3: await uploadToS3(media.file, SourceInURL.Farcaster),
                    };
                }),
            );
        },
        compose: (images) => {
            return FarcasterSocialMediaProvider.publishPost(composeDraft('Post', images));
        },
        reply: (images) => {
            if (!farcasterParentPost) throw new Error(t`No parent post found.`);
            // for farcaster, post id is read from post.commentOn.postId
            return FarcasterSocialMediaProvider.commentPost('', composeDraft('Comment', images));
        },
        quote: () => {
            if (!farcasterParentPost) throw new Error(t`No parent post found.`);
            return FarcasterSocialMediaProvider.mirrorPost(farcasterParentPost.postId);
        },
    });

    return postTo(type, compositePost);
}
