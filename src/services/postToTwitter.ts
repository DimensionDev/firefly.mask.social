import { SocialPlatform } from '@/constants/enum.js';
import { readChars } from '@/helpers/readChars.js';
import { TwitterSocialMediaProvider } from '@/providers/twitter/SocialMedia.js';
import { ProfileStatus } from '@/providers/types/SocialMedia.js';
import { uploadToTwitter } from '@/services/uploadToTwitter.js';
import type { CompositePost } from '@/store/useComposeStore.js';
import type { ComposeType } from '@/types/compose.js';

function createDummyProfile() {
    return {
        profileId: '',
        handle: '',
        pfp: '',
        displayName: '',
        followerCount: 0,
        followingCount: 0,
        fullHandle: '',
        status: ProfileStatus.Active,
        source: SocialPlatform.Twitter,
        verified: true,
    };
}

export async function postToTwitter(type: ComposeType, { chars, images }: CompositePost) {
    if (type === 'compose') throw new Error('Invalid compose type');

    const medias = await uploadToTwitter(images.map((x) => x.file));

    return TwitterSocialMediaProvider.publishPost({
        postId: '',
        author: createDummyProfile(),
        metadata: {
            locale: 'en',
            content: {
                content: readChars(chars),
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
