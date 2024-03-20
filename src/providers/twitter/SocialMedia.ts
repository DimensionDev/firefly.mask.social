import { type Provider, SessionType } from '@/providers/types/SocialMedia.js';

// @ts-ignore
class TwitterSocialMedia implements Provider {
    get type() {
        return SessionType.Twitter;
    }
}

export const TwitterSocialMediaProvider = new TwitterSocialMedia();
