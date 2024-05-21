import { t } from '@lingui/macro';

import { Source } from '@/constants/enum.js';
import { readChars } from '@/helpers/chars.js';
import { createDummyProfile } from '@/helpers/createDummyProfile.js';
import { resolveSourceName } from '@/helpers/resolveSourceName.js';
import { TwitterSocialMediaProvider } from '@/providers/twitter/SocialMedia.js';
import type { Poll } from '@/providers/types/Poll.js';
import { type Post, type PostType } from '@/providers/types/SocialMedia.js';
import { createPostTo } from '@/services/createPostTo.js';
import { uploadToTwitter } from '@/services/uploadToTwitter.js';
import { type CompositePost } from '@/store/useComposeStore.js';
import { useTwitterStateStore } from '@/store/useProfileStore.js';
import type { ComposeType } from '@/types/compose.js';
import type { MediaObject } from '@/types/index.js';
import { first } from 'lodash-es';

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
                    content: readChars(chars),
                },
            },
            mediaObjects: images.map((media) => ({ url: media.imgur!, mimeType: media.file.type, id: media.id })),
            restriction,
            parentPostId: twitterParentPost?.postId ?? '',
            source: Source.Twitter,
            poll: first(polls),
        } satisfies Post;
    };

    const postTo = createPostTo(Source.Twitter, {
        uploadPolls: async () => {
            if (!poll) return [];
            return [
                {
                    id: '',
                    options: poll.options.map((option) => ({ id: option.id, label: option.label })),
                    validInDays: poll.validInDays,
                },
            ];
        },
        uploadImages: async () => {
            const uploaded = await uploadToTwitter(images.map((x) => x.file));
            return uploaded.map((x) => ({
                id: x.media_id_string,
                url: '',
                file: x.file,
            }));
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
