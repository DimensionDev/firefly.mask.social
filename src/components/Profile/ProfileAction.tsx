import { useMemo } from 'react';

import { EditProfileButton } from '@/components/EditProfile/EditProfileButton.js';
import { FollowButton } from '@/components/Profile/FollowButton.js';
import { ProfileLoginStatus } from '@/components/Profile/ProfileLoginStatus.js';
import { ProfileMoreAction, type ProfileMoreActionProps } from '@/components/Profile/ProfileMoreAction.js';
import { isSameFireflyIdentity } from '@/helpers/isSameFireflyIdentity.js';
import { isSameProfile } from '@/helpers/isSameProfile.js';
import { resolveFireflyIdentity } from '@/helpers/resolveFireflyProfileId.js';
import { useCurrentFireflyProfilesAll } from '@/hooks/useCurrentFireflyProfiles.js';
import { useCurrentProfile } from '@/hooks/useCurrentProfile.js';
import { useIsSmall } from '@/hooks/useMediaQuery.js';
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
    const myProfile = useCurrentProfile(profile.source);
    const isEditableProfile = isSameProfile(myProfile, profile);

    const isSmall = useIsSmall();

    const button = useMemo(() => {
        if (isEditableProfile) return <EditProfileButton profile={profile} variant={isSmall ? 'text' : 'icon'} />;
        if (isRelatedProfile) return <ProfileLoginStatus profile={profile} />;
        return (
            <FollowButton
                profile={profile}
                variant={isSmall ? 'text' : 'icon'}
                className={isSmall ? undefined : '!w-[50px] !min-w-[50px] !max-w-[50px]'}
            />
        );
    }, [isEditableProfile, isSmall, isRelatedProfile, profile]);

    return (
        <>
            {button}
            <ProfileMoreAction {...ProfileMoreActionProps} profile={profile} />
        </>
    );
}
