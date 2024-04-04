import { t } from '@lingui/macro';

import { SocialPlatform } from '@/constants/enum.js';
import { createDummyProfile } from '@/helpers/createDummyProfile.js';
import { readChars } from '@/helpers/readChars.js';
import { TwitterSocialMediaProvider } from '@/providers/twitter/SocialMedia.js';
import { type Post } from '@/providers/types/SocialMedia.js';
import { createPostTo } from '@/services/postTo.js';
import { uploadToTwitter } from '@/services/uploadToTwitter.js';
import { type CompositePost } from '@/store/useComposeStore.js';
import { useTwitterStateStore } from '@/store/useProfileStore.js';
import type { ComposeType } from '@/types/compose.js';
import type { MediaObject } from '@/types/index.js';

export async function postToTwitter(type: ComposeType, compositePost: CompositePost) {
    const { chars, images, postId, parentPost, restriction } = compositePost;

    const twitterPostId = postId.Twitter;
    const twitterParentPost = parentPost.Twitter;

    // already posted to x
    if (twitterPostId) throw new Error(t`Already posted on X.`);

    // login required
    const { currentProfile } = useTwitterStateStore.getState();
    if (!currentProfile?.profileId) throw new Error(t`Login required to post on X.`);

    const composeDraft = (images: MediaObject[]) => {
        return {
            postId: '',
            author: createDummyProfile(),
            metadata: {
                locale: 'en',
                content: {
                    content: readChars(chars),
                },
            },
            mediaObjects: images.map((media) => ({ url: media.imgur!, mimeType: media.file.type })),
            restriction,
            parentPostId: twitterParentPost?.postId ?? '',
            source: SocialPlatform.Twitter,
        } satisfies Post;
    };

    const postTo = createPostTo(SocialPlatform.Twitter, {
        uploadImages: async () => {
            const uploaded = await uploadToTwitter(images.map((x) => x.file));
            return uploaded.map((x) => ({
                id: x.media_id_string,
                url: '',
                file: x.file,
            }));
        },
        compose: (images) => TwitterSocialMediaProvider.publishPost(composeDraft(images)),
        reply: (images) => TwitterSocialMediaProvider.publishPost(composeDraft(images)),
        quote: (images) => {
            if (!twitterParentPost?.postId) throw new Error(t`No parent post found.`);
            return TwitterSocialMediaProvider.quotePost(twitterParentPost.postId, composeDraft(images));
        },
    });

    return postTo(type, compositePost);
}
