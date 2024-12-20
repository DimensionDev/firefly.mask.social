import { ProfileInList } from '@/components/ProfileInList.js';
import { type SocialSource, Source } from '@/constants/enum.js';
import type { Profile } from '@/providers/types/SocialMedia.js';

export function getFollowInList(index: number, profile: Profile, source?: SocialSource) {
    return (
        <ProfileInList
            profile={profile}
            key={`${profile.profileId}-${index}`}
            hideFollowers={source === Source.Farcaster}
        />
    );
}
