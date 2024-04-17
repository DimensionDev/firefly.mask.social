import { Link } from '@/esm/Link.js';
import { getProfileUrl } from '@/helpers/getProfileUrl.js';
import type { Profile } from '@/providers/types/SocialMedia.js';

interface Props {
    profile: Profile;
}
export function ProfileLink({ profile }: Props) {
    return (
        <Link href={getProfileUrl(profile)}>
            <strong>{profile.displayName.trim()}</strong>
        </Link>
    );
}
