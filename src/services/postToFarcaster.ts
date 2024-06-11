import { t } from '@lingui/macro';
import { uniqBy } from 'lodash-es';

import { Source, SourceInURL } from '@/constants/enum.js';
import { MAX_IMAGE_SIZE_PER_POST } from '@/constants/index.js';
import { readChars } from '@/helpers/chars.js';
import { getPollFrameUrl } from '@/helpers/getPollFrameUrl.js';
import { isHomeChannel } from '@/helpers/isSameChannel.js';
import { resolveSourceName } from '@/helpers/resolveSourceName.js';
import { FarcasterPollProvider } from '@/providers/farcaster/Poll.js';
import { FarcasterSocialMediaProvider } from '@/providers/farcaster/SocialMedia.js';
import type { Poll } from '@/providers/types/Poll.js';
import { type Post, type PostType } from '@/providers/types/SocialMedia.js';
import { createPostTo } from '@/services/createPostTo.js';
import { uploadToS3 } from '@/services/uploadToS3.js';
import { type CompositePost } from '@/store/useComposeStore.js';
import { useFarcasterStateStore } from '@/store/useProfileStore.js';
import type { ComposeType } from '@/types/compose.js';
import type { MediaObject } from '@/types/index.js';

export async function postToFarcaster(type: ComposeType, compositePost: CompositePost) {
    const { chars, parentPost, images, frames, openGraphs, postId, channel, poll } = compositePost;

    const farcasterPostId = postId.Farcaster;
    const farcasterParentPost = parentPost.Farcaster;
    const sourceName = resolveSourceName(Source.Farcaster);

    // already posted to lens
    if (farcasterPostId) throw new Error(t`Already posted on ${sourceName}.`);

    // login required
    const { currentProfile } = useFarcasterStateStore.getState();
    if (!currentProfile?.profileId) throw new Error(t`Login required to post on ${sourceName}.`);

    const composeDraft = (postType: PostType, images: MediaObject[], polls?: Poll[]) => {
        const currentChannel = channel[Source.Farcaster];
        return {
            publicationId: '',
            type: postType,
            postId: '',
            source: Source.Farcaster,
            author: currentProfile,
            metadata: {
                locale: '',
                content: {
                    content: readChars(chars, false, Source.Farcaster),
                },
            },
            mediaObjects: uniqBy(
                [
                    ...images.map((media) => ({ url: media.s3!, mimeType: media.file.type })),
                    ...frames.map((frame) => ({ title: frame.title, url: frame.url })),
                    ...openGraphs.map((openGraph) => ({ title: openGraph.title!, url: openGraph.url })),
                    ...(polls ?? []).map((poll) => ({
                        url: getPollFrameUrl({ pollId: poll.id, source: Source.Farcaster }),
                    })),
                ],
                (x) => x.url.toLowerCase(),
            ).slice(0, MAX_IMAGE_SIZE_PER_POST[Source.Farcaster]),
            commentOn: type === 'reply' && farcasterParentPost ? farcasterParentPost : undefined,
            parentChannelKey: isHomeChannel(currentChannel) ? undefined : currentChannel?.id,
            parentChannelUrl: isHomeChannel(currentChannel) ? undefined : currentChannel?.parentUrl,
        } satisfies Post;
    };

    const postTo = createPostTo(Source.Farcaster, {
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
        uploadPolls: async () => {
            if (!poll) return [];
            const pollStub = await FarcasterPollProvider.createPoll(poll, readChars(chars, false, Source.Farcaster));
            return [pollStub];
        },
        compose: (images, _, polls) => {
            return FarcasterSocialMediaProvider.publishPost(composeDraft('Post', images, polls));
        },
        reply: (images, _, polls) => {
            if (!farcasterParentPost) throw new Error(t`No parent post found.`);
            // for farcaster, post id is read from post.commentOn.postId
            return FarcasterSocialMediaProvider.commentPost('', composeDraft('Comment', images, polls));
        },
        quote: (images, _, polls) => {
            if (!farcasterParentPost) throw new Error(t`No parent post found.`);
            return FarcasterSocialMediaProvider.quotePost(
                farcasterParentPost.postId,
                composeDraft('Quote', images, polls),
                farcasterParentPost.author.profileId,
            );
        },
    });

    return postTo(type, compositePost);
}
