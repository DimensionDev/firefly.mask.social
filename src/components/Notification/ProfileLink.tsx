import { Link } from '@/components/Link.js';
import { ProfileTippy } from '@/components/Profile/ProfileTippy.js';
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
        <ProfileTippy identity={identity}>
            <Link href={getProfileUrl(profile)} className="truncate font-bold hover:underline">
                {profile.displayName.trim()}
            </Link>
        </ProfileTippy>
    );
}
