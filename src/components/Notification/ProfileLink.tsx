import { Link } from '@/esm/Link.js';
import type { Profile } from '@/providers/types/SocialMedia.js';

interface Props {
    profile: Profile;
}
export function ProfileLink({ profile }: Props) {
    return (
        <Link href={`/profile/${profile.handle}`}>
            <strong>{profile.displayName}</strong>
        </Link>
    );
}
