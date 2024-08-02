import { ProfileTippy } from '@/components/Profile/ProfileTippy.js';
import { Source } from '@/constants/enum.js';
import { Link } from '@/esm/Link.js';
import { getProfileUrl } from '@/helpers/getProfileUrl.js';
import type { Profile } from '@/providers/types/SocialMedia.js';

interface Props {
    profile: Profile;
}

export function ProfileLink({ profile }: Props) {
    const identity = profile.source === Source.Lens ? profile.handle : profile.profileId;
    return (
        <ProfileTippy identity={identity} source={profile.source} profile={profile}>
            <Link href={getProfileUrl(profile)} className="font-bold hover:underline">
                <strong>{profile.displayName.trim()}</strong>
            </Link>
        </ProfileTippy>
    );
}
