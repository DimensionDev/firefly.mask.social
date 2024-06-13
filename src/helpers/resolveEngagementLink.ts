import { EngagementType, type SocialSource } from '@/constants/enum.js';
import { resolveSocialSourceInURL } from '@/helpers/resolveSourceInURL.js';

export function resolveEngagementLink(postId: string, source: SocialSource, engagementType: EngagementType) {
    return `/post/${postId}/${engagementType}?source=${resolveSocialSourceInURL(source)}`;
}
