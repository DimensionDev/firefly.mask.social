import { SocialPlatform } from '@/constants/enum.js';
import { readChars } from '@/helpers/readChars.js';
import { TwitterSocialMediaProvider } from '@/providers/twitter/SocialMedia.js';
import { uploadToTwitter } from '@/services/uploadToTwitter.js';
import type { CompositePost } from '@/store/useComposeStore.js';
import type { ComposeType } from '@/types/compose.js';

export async function postToTwitter(type: ComposeType, compositePost: CompositePost) {
    const { images } = compositePost;

    const medias = await uploadToTwitter(images.map((x) => x.file));

    return TwitterSocialMediaProvider.publishPost({
        postId: '',
        author: null,
        metadata: {
            locale: 'en',
            content: {
                content: readChars(compositePost.chars),
            },
        },
        mediaObjects: medias.map((x) => ({
            id: x.media_id_string,
            url: '',
            type: 'image',
        })),
        source: SocialPlatform.Twitter,
    });
}
