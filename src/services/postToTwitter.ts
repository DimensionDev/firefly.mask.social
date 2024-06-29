import { t } from '@lingui/macro';
import { first } from 'lodash-es';

import { Source } from '@/constants/enum.js';
import { readChars } from '@/helpers/chars.js';
import { confirmMediasFile } from '@/helpers/confirmMediasFile.js';
import { createDummyProfile } from '@/helpers/createDummyProfile.js';
import { createTwitterMediaObject } from '@/helpers/resolveMediaObjectPreviewUrl.js';
import { resolveSourceName } from '@/helpers/resolveSourceName.js';
import { TwitterPollProvider } from '@/providers/twitter/Poll.js';
import { TwitterSocialMediaProvider } from '@/providers/twitter/SocialMedia.js';
import type { Poll } from '@/providers/types/Poll.js';
import { type Post, type PostType } from '@/providers/types/SocialMedia.js';
import { createPostTo } from '@/services/createPostTo.js';
import { uploadToTwitter } from '@/services/uploadToTwitter.js';
import { type CompositePost } from '@/store/useComposeStore.js';
import { useTwitterStateStore } from '@/store/useProfileStore.js';
import { MediaSource, type ComposeType, type MediaObject } from '@/types/compose.js';

export async function postToTwitter(type: ComposeType, compositePost: CompositePost) {
    const { chars, images, postId, parentPost, restriction, poll } = compositePost;

    const twitterPostId = postId.Twitter;
    const twitterParentPost = parentPost.Twitter;
    const sourceName = resolveSourceName(Source.Twitter);

    // already posted to x
    if (twitterPostId) throw new Error(t`Already posted on ${sourceName}.`);

    // login required
    const { currentProfile } = useTwitterStateStore.getState();
    if (!currentProfile?.profileId) throw new Error(t`Login required to post on ${sourceName}.`);

    const composeDraft = (postType: PostType, images: MediaObject[], polls?: Poll[]) => {
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
            mediaObjects: images.map((media) => ({
                url: media.urls?.[MediaSource.Twimg] ?? '',
                mimeType: media.mimeType,
                id: media.id,
            })),
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
        uploadImages: async () => {
            const confirmedMedias = await confirmMediasFile(images);
            const uploaded = await uploadToTwitter(confirmedMedias.map((x) => x.file));
            return uploaded.map((x) => createTwitterMediaObject(x));
        },
        compose: (images, _, polls) => TwitterSocialMediaProvider.publishPost(composeDraft('Post', images, polls)),
        reply: (images, _, polls) => {
            if (!twitterParentPost?.postId) throw new Error(t`No parent post found.`);
            return TwitterSocialMediaProvider.publishPost(composeDraft('Comment', images, polls));
        },
        quote: (images) => {
            if (!twitterParentPost?.postId) throw new Error(t`No parent post found.`);
            return TwitterSocialMediaProvider.quotePost(twitterParentPost.postId, composeDraft('Quote', images));
        },
    });

    return postTo(type, compositePost);
}
