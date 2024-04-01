import { safeUnreachable } from '@masknet/kit';
import { createPageable, EMPTY_LIST, type Pageable, type PageIndicator } from '@masknet/shared-base';

import { SocialPlatform } from '@/constants/enum.js';
import { FarcasterSocialMediaProvider } from '@/providers/farcaster/SocialMedia.js';
import { LensSocialMediaProvider } from '@/providers/lens/SocialMedia.js';
import { TwitterSocialMediaProvider } from '@/providers/twitter/SocialMedia.js';
import type { Post } from '@/providers/types/SocialMedia.js';

export async function discoverPosts(
    source: SocialPlatform,
    indicator: PageIndicator,
): Promise<Pageable<Post, PageIndicator>> {
    switch (source) {
        case SocialPlatform.Lens:
            return LensSocialMediaProvider.discoverPosts(indicator);
        case SocialPlatform.Farcaster:
            return FarcasterSocialMediaProvider.discoverPosts(indicator);
        case SocialPlatform.Twitter:
            return TwitterSocialMediaProvider.discoverPosts(indicator);
        default:
            safeUnreachable(source);
            return createPageable(EMPTY_LIST, indicator);
    }
}
