import { compact } from '@apollo/client/utilities';
import { t } from '@lingui/macro';
import { first } from 'lodash-es';

import { Source } from '@/constants/enum.js';
import { readChars } from '@/helpers/chars.js';
import { createDummyProfile } from '@/helpers/createDummyProfile.js';
import { downloadMediaObjects } from '@/helpers/downloadMediaObjects.js';
import { createTwitterMediaObject, resolveImageUrl, resolveUploadId } from '@/helpers/resolveMediaObjectUrl.js';
import { resolveSourceName } from '@/helpers/resolveSourceName.js';
import { resolveTwitterReplyRestriction } from '@/helpers/resolveTwitterReplyRestriction.js';
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
    const { chars, images, postId, parentPost, restriction, poll } = compositePost;

    const twitterPostId = postId.Twitter;
    const twitterParentPost = parentPost.Twitter;
    const sourceName = resolveSourceName(Source.Twitter);

    // already posted to x
    if (twitterPostId) return;

    // login required
    const { currentProfile } = useTwitterStateStore.getState();
    if (!currentProfile?.profileId) throw new Error(t`Login required to post on ${sourceName}.`);

    const composeDraft = (postType: PostType, images: MediaObject[], polls?: Poll[]) => {
        if (images.some((media) => !resolveUploadId(Source.Twitter, media))) {
            throw new Error(t`There are images that were not uploaded successfully.`);
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
            mediaObjects: images.map((media) => ({
                id: resolveUploadId(Source.Twitter, media),
                url: resolveImageUrl(Source.Twitter, media),
                mimeType: media.mimeType,
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
            const downloaded = await downloadMediaObjects(images);
            const uploaded = await uploadToTwitter(downloaded.map((x) => x.file));
            return uploaded.map((x, index) => createTwitterMediaObject(x, downloaded[index]));
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

export interface TwitterSchedulePostPayload {
    quote_tweet_id?: string;
    in_reply_to_tweet_id?: string;
    text: string;
    media_ids: string[];
    reply_settings: '' | 'following' | 'mentionedUsers';
    poll?: {
        options: Array<{ label: string }>;
        duration_minutes: number;
    };
}

export async function createTwitterSchedulePostPayload(
    type: ComposeType,
    compositePost: CompositePost,
    isThread = false,
): Promise<TwitterSchedulePostPayload> {
    const { chars, images, parentPost, restriction, poll } = compositePost;

    const twitterParentPost = parentPost.Twitter;

    const confirmedMedias = await downloadMediaObjects(images);
    const imageResults = (await uploadToTwitter(confirmedMedias.map((x) => x.file))).map((x) =>
        createTwitterMediaObject(x),
    );

    const pollResult = poll ? await TwitterPollProvider.createPoll(poll) : undefined;

    return {
        quote_tweet_id: twitterParentPost && type === 'quote' ? twitterParentPost.postId : undefined,
        in_reply_to_tweet_id: !isThread
            ? twitterParentPost && type === 'reply'
                ? twitterParentPost.postId
                : undefined
            : '$$in_reply_to_tweet_id$$',
        text: readChars(chars, 'both', Source.Twitter),
        media_ids: compact(imageResults?.map((x) => x.id)),
        reply_settings: resolveTwitterReplyRestriction(restriction),
        poll: pollResult
            ? {
                  options: pollResult.options.map((option) => ({ label: option.label })),
                  duration_minutes: pollResult.durationSeconds,
              }
            : undefined,
    };
}
