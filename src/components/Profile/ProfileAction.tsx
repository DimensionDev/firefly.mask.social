import { FollowButton } from '@/components/Profile/FollowButton.js';
import { ProfileLoginStatus } from '@/components/Profile/ProfileLoginStatus.js';
import { ProfileMoreAction, type ProfileMoreActionProps } from '@/components/Profile/ProfileMoreAction.js';
import { isSameFireflyIdentity } from '@/helpers/isSameFireflyIdentity.js';
import { resolveFireflyIdentity } from '@/helpers/resolveFireflyProfileId.js';
import { useCurrentFireflyProfilesAll } from '@/hooks/useCurrentFireflyProfiles.js';
import type { Profile } from '@/providers/types/SocialMedia.js';

interface ProfileActionProps {
    profile: Profile;
    ProfileMoreActionProps?: Partial<ProfileMoreActionProps>;
}

export function ProfileAction({ profile, ProfileMoreActionProps }: ProfileActionProps) {
    const profiles = useCurrentFireflyProfilesAll();
    const identity = resolveFireflyIdentity(profile);
    const isRelatedProfile = identity
        ? profiles.some((x) => {
              isSameFireflyIdentity(x.identity, identity);
          })
        : false;

    return (
        <>
            {!isRelatedProfile ? <FollowButton profile={profile} /> : <ProfileLoginStatus profile={profile} />}
            <ProfileMoreAction {...ProfileMoreActionProps} profile={profile} />
        </>
    );
}
