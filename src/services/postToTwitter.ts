import { t } from '@lingui/macro';
import { safeUnreachable } from '@masknet/kit';

import { SocialPlatform } from '@/constants/enum.js';
import { createDummyProfile } from '@/helpers/createDummyProfile.js';
import { enqueueErrorMessage, enqueueSuccessMessage } from '@/helpers/enqueueMessage.js';
import { readChars } from '@/helpers/readChars.js';
import { TwitterSocialMediaProvider } from '@/providers/twitter/SocialMedia.js';
import { type Post } from '@/providers/types/SocialMedia.js';
import { uploadToTwitter } from '@/services/uploadToTwitter.js';
import type { CompositePost } from '@/store/useComposeStore.js';
import type { ComposeType } from '@/types/compose.js';

export async function postToTwitter(
    type: ComposeType,
    { chars, images, postId, parentPost, restriction }: CompositePost,
) {
    const twitterPostId = postId.Twitter;
    const twitterParentPost = parentPost.Twitter;

    // alreay posted to lens
    if (twitterPostId) throw new Error(`Already posted on X.`);

    try {
        const medias = await uploadToTwitter(images.map((x) => x.file));

        const draft: Post = {
            postId: '',
            author: createDummyProfile(),
            metadata: {
                locale: 'en',
                content: {
                    content: readChars(chars),
                },
            },
            restriction,
            parentPostId: twitterParentPost?.postId ?? '',
            mediaObjects: medias.map((x) => ({
                id: x.media_id_string,
                url: '',
                type: 'image',
            })),
            source: SocialPlatform.Twitter,
        };

        switch (type) {
            case 'compose': {
                const post = await TwitterSocialMediaProvider.publishPost(draft);
                enqueueSuccessMessage(t`Posted to X.`);
                return post;
            }
            case 'reply': {
                if (!twitterParentPost?.postId) throw new Error(t`No parent post found.`);
                const post = await TwitterSocialMediaProvider.publishPost(draft);
                enqueueSuccessMessage(t`Replied to X.`);
                return post;
            }
            case 'quote': {
                if (!twitterParentPost?.postId) throw new Error(t`No parent post found.`);
                const post = await TwitterSocialMediaProvider.quotePost(twitterParentPost.postId, draft);
                enqueueSuccessMessage(t`Quoted post on X.`);
                return post;
            }
            default:
                safeUnreachable(type);
                throw new Error(t`Invalid compose type.`);
        }
    } catch (error) {
        enqueueErrorMessage(t`Failed to post to X.`);
        throw error;
    }
}
