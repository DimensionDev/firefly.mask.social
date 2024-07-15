import { FollowButton } from '@/components/Profile/FollowButton.js';
import { ProfileLoginStatus } from '@/components/Profile/ProfileLoginStatus.js';
import { ProfileMoreAction } from '@/components/Profile/ProfileMoreAction.js';
import { Source } from '@/constants/enum.js';
import { resolveProfileId } from '@/helpers/resolveProfileId.js';
import { useCurrentFireflyProfilesAll } from '@/hooks/useCurrentFireflyProfiles.js';
import type { Profile } from '@/providers/types/SocialMedia.js';

interface ProfileActionProps {
    profile: Profile;
}

export function ProfileAction({ profile }: ProfileActionProps) {
    const profiles = useCurrentFireflyProfilesAll();

    const isRelatedProfile = profiles.some((current) => {
        return current.source === profile.source && current.identity === resolveProfileId(profile);
    });

    if (profile.source === Source.Twitter) return null;

    return (
        <>
            {!isRelatedProfile ? (
                <FollowButton className="ml-auto" profile={profile} />
            ) : (
                <ProfileLoginStatus className="ml-auto" profile={profile} />
            )}
            <ProfileMoreAction profile={profile} />
        </>
    );
}
