import { t } from '@lingui/macro';
import { uniqBy } from 'lodash-es';

import { Source, SourceInURL } from '@/constants/enum.js';
import { MAX_IMAGE_SIZE_PER_POST } from '@/constants/limitation.js';
import { readChars } from '@/helpers/chars.js';
import { isFrameV1 } from '@/helpers/frame.js';
import { getPollFrameUrl } from '@/helpers/getPollFrameUrl.js';
import { isHomeChannel } from '@/helpers/isSameChannel.js';
import { createS3MediaObject, resolveImageUrl, resolveVideoUrl } from '@/helpers/resolveMediaObjectUrl.js';
import { resolveSourceName } from '@/helpers/resolveSourceName.js';
import { FarcasterPollProvider } from '@/providers/farcaster/Poll.js';
import { farcasterSessionHolder } from '@/providers/farcaster/SessionHolder.js';
import { FarcasterSocialMediaProvider } from '@/providers/farcaster/SocialMedia.js';
import type { Poll } from '@/providers/types/Poll.js';
import { type Post, type PostType } from '@/providers/types/SocialMedia.js';
import { createPostTo } from '@/services/createPostTo.js';
import { uploadAndConvertToM3u8 } from '@/services/uploadAndConvertToM3u8.js';
import { uploadToS3 } from '@/services/uploadToS3.js';
import { validateFarcasterSession } from '@/services/validateFarcasterSignerKey.js';
import { type CompositePost } from '@/store/useComposeStore.js';
import { useFarcasterStateStore } from '@/store/useProfileStore.js';
import { type ComposeType, type MediaObject } from '@/types/compose.js';

export async function postToFarcaster(type: ComposeType, compositePost: CompositePost, signal?: AbortSignal) {
    const { chars, parentPost, images, video, frames, openGraphs, postId, channel, poll } = compositePost;

    const farcasterPostId = postId.Farcaster;
    const farcasterParentPost = parentPost.Farcaster;
    const sourceName = resolveSourceName(Source.Farcaster);

    // already posted to farcaster
    if (farcasterPostId) return;

    // login required
    const { currentProfile } = useFarcasterStateStore.getState();
    if (!currentProfile?.profileId) throw new Error(t`Login required to post on ${sourceName}.`);

    const composeDraft = (postType: PostType, images: MediaObject[], videos: MediaObject[], polls?: Poll[]) => {
        if (
            images.some((image) => !resolveImageUrl(Source.Farcaster, image)) ||
            videos.some((video) => !resolveVideoUrl(Source.Farcaster, video))
        ) {
            throw new Error(t`There are images or videos that were not uploaded successfully.`);
        }

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
                    content: readChars(chars, 'both', Source.Farcaster),
                },
            },
            mediaObjects: uniqBy(
                [
                    ...images.map((media) => ({
                        url: resolveImageUrl(Source.Farcaster, media),
                        mimeType: media.mimeType,
                    })),
                    ...frames.filter(isFrameV1).map((frame) => ({ title: frame.title, url: frame.url })),
                    ...openGraphs.map((openGraph) => ({ title: openGraph.title!, url: openGraph.url })),
                    ...(polls ?? []).map((poll) => ({
                        url: getPollFrameUrl(poll.id, Source.Farcaster),
                    })),
                    ...videos.map((media) => ({
                        url: resolveVideoUrl(Source.Farcaster, media),
                        mimeType: media.mimeType,
                    })),
                ],
                (x) => x.url.toLowerCase(),
            ).slice(0, MAX_IMAGE_SIZE_PER_POST[Source.Farcaster]),
            commentOn: type === 'reply' && farcasterParentPost ? farcasterParentPost : undefined,
            parentChannelKey: isHomeChannel(currentChannel) ? undefined : currentChannel?.id,
            parentChannelUrl: isHomeChannel(currentChannel) ? undefined : currentChannel?.parentUrl,
        } satisfies Post;
    };

    const validateSignerKey = async () => {
        await validateFarcasterSession(farcasterSessionHolder.sessionRequired);
    };

    const postTo = createPostTo(Source.Farcaster, {
        uploadImages: () => {
            return Promise.all(
                images.map(async (media) => {
                    if (resolveImageUrl(Source.Farcaster, media)) return media;
                    return createS3MediaObject(await uploadToS3(media.file, SourceInURL.Farcaster), media);
                }),
            );
        },
        uploadVideos: () => {
            return Promise.all(
                (video?.file ? [video] : []).map(async (media) => {
                    return createS3MediaObject(
                        await uploadAndConvertToM3u8(media.file, SourceInURL.Farcaster, signal),
                        media,
                    );
                }),
            );
        },
        uploadPolls: async () => {
            if (!poll) return [];
            const pollStub = await FarcasterPollProvider.createPoll(poll, readChars(chars, 'both', Source.Farcaster));
            return [pollStub];
        },
        compose: async (images, videos, polls) => {
            await validateSignerKey();
            return FarcasterSocialMediaProvider.publishPost(composeDraft('Post', images, videos, polls));
        },
        reply: async (images, videos, polls) => {
            await validateSignerKey();
            if (!farcasterParentPost) throw new Error(t`No parent post found.`);
            // for farcaster, post id is read from post.commentOn.postId
            return FarcasterSocialMediaProvider.commentPost('', composeDraft('Comment', images, videos, polls));
        },
        quote: async (images, videos, polls) => {
            await validateSignerKey();
            if (!farcasterParentPost) throw new Error(t`No parent post found.`);
            return FarcasterSocialMediaProvider.quotePost(
                farcasterParentPost.postId,
                composeDraft('Quote', images, videos, polls),
                farcasterParentPost.author.profileId,
            );
        },
    });

    return postTo(type, compositePost);
}
