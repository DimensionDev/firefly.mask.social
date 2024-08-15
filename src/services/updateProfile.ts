import { type SocialSource, Source } from '@/constants/enum.js';
import { FarcasterSocialMediaProvider } from '@/providers/farcaster/SocialMedia.js';
import { LensSocialMediaProvider } from '@/providers/lens/SocialMedia.js';
import { TwitterSocialMediaProvider } from '@/providers/twitter/SocialMedia.js';
import type { UpdateProfileParams } from '@/providers/types/SocialMedia.js';

export async function updateProfile(source: SocialSource, params: UpdateProfileParams) {
    switch (source) {
        case Source.Farcaster:
            await FarcasterSocialMediaProvider.updateProfile(params);
            break;
        case Source.Lens:
            await LensSocialMediaProvider.updateProfile(params);
            break;
        case Source.Twitter:
            await TwitterSocialMediaProvider.updateProfile(params);
    }
}
