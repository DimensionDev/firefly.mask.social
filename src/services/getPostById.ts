import { safeUnreachable } from '@masknet/kit';

import { SocialPlatform } from '@/constants/enum.js';
import { FarcasterSocialMediaProvider } from '@/providers/farcaster/SocialMedia.js';
import { LensSocialMediaProvider } from '@/providers/lens/SocialMedia.js';
import { TwitterSocialMediaProvider } from '@/providers/twitter/SocialMedia.js';

export async function getPostById(source: SocialPlatform, postId: string) {
    switch (source) {
        case SocialPlatform.Lens:
            return LensSocialMediaProvider.getPostById(postId);
        case SocialPlatform.Farcaster:
            return FarcasterSocialMediaProvider.getPostById(postId);
        case SocialPlatform.Twitter:
            return TwitterSocialMediaProvider.getPostById(postId);
        default:
            safeUnreachable(source);
            return null;
    }
}
