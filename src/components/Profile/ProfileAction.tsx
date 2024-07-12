import { FollowButton } from '@/components/Profile/FollowButton.js';
import { ProfileLoginStatus } from '@/components/Profile/ProfileLoginStatus.js';
import { ProfileMoreAction } from '@/components/Profile/ProfileMoreAction.js';
import { Source } from '@/constants/enum.js';
import { isCurrentProfile } from '@/helpers/isCurrentProfile.js';
import type { Profile } from '@/providers/types/SocialMedia.js';

interface ProfileActionProps {
    profile: Profile;
}

export function ProfileAction({ profile }: ProfileActionProps) {
    if (profile.source === Source.Twitter) return null;

    return (
        <>
            {isCurrentProfile(profile) ? (
                <FollowButton className="ml-auto" profile={profile} />
            ) : (
                <ProfileLoginStatus className="ml-auto" profile={profile} />
            )}
            <ProfileMoreAction profile={profile} />
        </>
    );
}
