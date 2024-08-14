import { t } from '@lingui/macro';
import { first, uniqBy } from 'lodash-es';

import { Source } from '@/constants/enum.js';
import { readChars } from '@/helpers/chars.js';
import { createDummyProfile } from '@/helpers/createDummyProfile.js';
import { downloadMediaObjects } from '@/helpers/downloadMediaObjects.js';
import { createTwitterMediaObject, resolveImageUrl, resolveUploadId } from '@/helpers/resolveMediaObjectUrl.js';
import { resolveSourceName } from '@/helpers/resolveSourceName.js';
import { TwitterPollProvider } from '@/providers/twitter/Poll.js';
import { TwitterSocialMediaProvider } from '@/providers/twitter/SocialMedia.js';
import type { Poll } from '@/providers/types/Poll.js';
import { type Post, type PostType } from '@/providers/types/SocialMedia.js';
import { createPostTo } from '@/services/createPostTo.js';
import { uploadToTwitter } from '@/services/uploadToTwitter.js';
import { type CompositePost } from '@/store/useComposeStore.js';
import { useTwitterStateStore } from '@/store/useProfileStore.js';
import { type ComposeType, type MediaObject } from '@/types/compose.js';

export async function postToTwitter(type: ComposeType, compositePost: CompositePost) {
    const { chars, images, video, postId, parentPost, restriction, poll } = compositePost;

    const twitterPostId = postId.Twitter;
    const twitterParentPost = parentPost.Twitter;
    const sourceName = resolveSourceName(Source.Twitter);

    // already posted to x
    if (twitterPostId) return;

    // login required
    const { currentProfile } = useTwitterStateStore.getState();
    if (!currentProfile?.profileId) throw new Error(t`Login required to post on ${sourceName}.`);

    const composeDraft = (postType: PostType, images: MediaObject[], videos: MediaObject[], polls?: Poll[]) => {
        if (images.some((media) => !resolveUploadId(Source.Twitter, media))) {
            throw new Error(t`There are images that were not uploaded successfully.`);
        }
        if (videos.some((media) => !resolveUploadId(Source.Twitter, media))) {
            throw new Error(t`There are videos that were not uploaded successfully.`);
        }

        return {
            publicationId: '',
            type: postType,
            postId: '',
            author: createDummyProfile(Source.Twitter),
            metadata: {
                locale: 'en',
                content: {
                    content: readChars(chars, 'both', Source.Twitter),
                },
            },
            mediaObjects: uniqBy(
                [...images, ...videos].map((media) => ({
                    id: resolveUploadId(Source.Twitter, media),
                    url: resolveImageUrl(Source.Twitter, media),
                    mimeType: media.mimeType,
                })),
                'id',
            ),
            restriction,
            parentPostId: twitterParentPost?.postId ?? '',
            source: Source.Twitter,
            poll: first(polls),
        } satisfies Post;
    };

    const postTo = createPostTo(Source.Twitter, {
        uploadPolls: async () => {
            if (!poll) return [];
            const pollStub = await TwitterPollProvider.createPoll(poll);
            return [pollStub];
        },
        uploadVideos: async () => {
            if (!video) return [];
            const uploaded = await uploadToTwitter([video.file]);
            return uploaded.map((x) => createTwitterMediaObject(x, video));
        },
        uploadImages: async () => {
            const downloaded = await downloadMediaObjects(images);
            const uploaded = await uploadToTwitter(downloaded.map((x) => x.file));
            return uploaded.map((x, index) => createTwitterMediaObject(x, downloaded[index]));
        },
        compose: (images, videos, polls) =>
            TwitterSocialMediaProvider.publishPost(composeDraft('Post', images, videos, polls)),
        reply: (images, videos, polls) => {
            if (!twitterParentPost?.postId) throw new Error(t`No parent post found.`);
            return TwitterSocialMediaProvider.publishPost(composeDraft('Comment', images, videos, polls));
        },
        quote: (images, videos) => {
            if (!twitterParentPost?.postId) throw new Error(t`No parent post found.`);
            return TwitterSocialMediaProvider.quotePost(
                twitterParentPost.postId,
                composeDraft('Quote', images, videos),
            );
        },
    });

    return postTo(type, compositePost);
}
