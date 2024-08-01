import { FollowButton } from '@/components/Profile/FollowButton.js';
import { ProfileLoginStatus } from '@/components/Profile/ProfileLoginStatus.js';
import { ProfileMoreAction, type ProfileMoreActionProps } from '@/components/Profile/ProfileMoreAction.js';
import { resolveProfileId } from '@/helpers/resolveProfileId.js';
import { useCurrentFireflyProfilesAll } from '@/hooks/useCurrentFireflyProfiles.js';
import type { Profile } from '@/providers/types/SocialMedia.js';

interface ProfileActionProps {
    profile: Profile;
    ProfileMoreActionProps?: Partial<ProfileMoreActionProps>;
}

export function ProfileAction({ profile, ProfileMoreActionProps }: ProfileActionProps) {
    const profiles = useCurrentFireflyProfilesAll();

    const isRelatedProfile = profiles.some((current) => {
        return current.source === profile.source && current.identity === resolveProfileId(profile);
    });

    return (
        <>
            {!isRelatedProfile ? (
                <FollowButton hasFollowBack={false} profile={profile} />
            ) : (
                <ProfileLoginStatus profile={profile} />
            )}
            <ProfileMoreAction {...ProfileMoreActionProps} profile={profile} />
        </>
    );
}
