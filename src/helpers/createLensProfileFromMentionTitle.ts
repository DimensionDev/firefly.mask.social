import { SocialPlatform } from '@/constants/enum.js';
import { getLensHandleFromMentionTitle } from '@/helpers/getLensHandleFromMentionTitle.js';
import { ProfileStatus } from '@/providers/types/SocialMedia.js';

export function createLensProfileFromMentionTitle(mentionTitle: string) {
    return {
        fullHandle: mentionTitle,
        source: SocialPlatform.Lens,
        handle: getLensHandleFromMentionTitle(mentionTitle),
        profileId: '',
        displayName: mentionTitle,
        pfp: '',
        followerCount: 0,
        followingCount: 0,
        status: ProfileStatus.Active,
        verified: true,
    };
}
