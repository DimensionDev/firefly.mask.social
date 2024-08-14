import type { HTMLProps } from 'react';

import { Avatar, type AvatarProps } from '@/components/Avatar.js';
import { ProfileTippy } from '@/components/Profile/ProfileTippy.js';
import { Link } from '@/esm/Link.js';
import { classNames } from '@/helpers/classNames.js';
import { getProfileUrl } from '@/helpers/getProfileUrl.js';
import { resolveFireflyIdentity } from '@/helpers/resolveFireflyProfileId.js';
import type { Profile } from '@/providers/types/SocialMedia.js';

interface AvatarGroupProps extends HTMLProps<HTMLDivElement> {
    profiles: Profile[];
    AvatarProps?: Omit<AvatarProps, 'alt'>;
}

export function AvatarGroup({ profiles, AvatarProps }: AvatarGroupProps) {
    return (
        <div className="flex items-center">
            {profiles.map((profile, index, self) => {
                const identity = resolveFireflyIdentity(profile);
                if (!identity) return null;

                return (
                    <ProfileTippy key={profile.profileId} identity={identity}>
                        <Link
                            href={getProfileUrl(profile)}
                            className={classNames('relative inline-flex items-center', {
                                '-ml-2.5': index > 0 && self.length > 1,
                            })}
                            style={{ zIndex: self.length - index }}
                        >
                            <Avatar src={profile.pfp} size={40} alt={profile.profileId} {...AvatarProps} />
                        </Link>
                    </ProfileTippy>
                );
            })}
        </div>
    );
}
