import type { TwitterUserInfo } from '@/providers/types/Firefly.js';
import type { ProfileVerifyInfo } from '@/providers/types/SocialMedia.js';

export function formatProfileVerifyInfoFromTwitterUserInfo(user: TwitterUserInfo): ProfileVerifyInfo {
    return {
        verified: user.is_blue_verified,
        badgeUrl: user.affiliates_highlighted_label.label.badge.url,
        description: user.affiliates_highlighted_label.label.description,
        __origin__: user,
    };
}
