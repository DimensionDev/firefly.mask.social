import { ProfileTippy } from '@/components/Profile/ProfileTippy.js';
import { Link } from '@/esm/Link.js';
import { getProfileUrl } from '@/helpers/getProfileUrl.js';
import { resolveFireflyIdentity } from '@/helpers/resolveFireflyProfileId.js';
import type { Profile } from '@/providers/types/SocialMedia.js';

interface Props {
    profile: Profile;
}

export function ProfileLink({ profile }: Props) {
    const identity = resolveFireflyIdentity(profile);
    if (!identity) return null;

    return (
        <ProfileTippy identity={identity} profile={profile}>
            <Link href={getProfileUrl(profile)} className="font-bold hover:underline">
                <strong>{profile.displayName.trim()}</strong>
            </Link>
        </ProfileTippy>
    );
}
