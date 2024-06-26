import { Avatar, type AvatarProps } from '@/components/Avatar.js';
import { Link } from '@/esm/Link.js';
import { classNames } from '@/helpers/classNames.js';
import { getProfileUrl } from '@/helpers/getProfileUrl.js';
import type { Profile } from '@/providers/types/SocialMedia.js';

interface AvatarGroupProps {
    profiles: Profile[];
    AvatarProps?: AvatarProps;
}

export function AvatarGroup({ profiles, AvatarProps }: AvatarGroupProps) {
    return (
        <div className="flex items-center">
            {profiles.map((profile, index, self) => (
                <Link
                    key={index}
                    href={getProfileUrl(profile)}
                    className={classNames('inline-flex items-center', {
                        '-ml-5': index > 0 && self.length > 1,
                    })}
                    style={{ zIndex: self.length - index }}
                >
                    <Avatar src={profile.pfp} size={40} alt={profile.profileId} {...AvatarProps} />
                </Link>
            ))}
        </div>
    );
}
