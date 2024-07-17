import { HTMLProps } from 'react';

import { ProfileTippy } from '@/components/Profile/ProfileTippy.js';
import { Source } from '@/constants/enum.js';
import { Link } from '@/esm/Link.js';
import { classNames } from '@/helpers/classNames.js';
import { getProfileUrl } from '@/helpers/getProfileUrl.js';
import type { Profile } from '@/providers/types/SocialMedia.js';

interface Props extends HTMLProps<HTMLAnchorElement> {
    profile: Profile;
}
export function ProfileLink({ profile, className, ...rest }: Props) {
    const identity = profile.source === Source.Lens ? profile.handle : profile.profileId;
    return (
        <ProfileTippy identity={identity} source={profile.source} profile={profile}>
            <Link
                href={getProfileUrl(profile)}
                className={classNames('font-bold hover:underline', className)}
                {...rest}
            >
                <strong className="font-inherit">{profile.displayName.trim()}</strong>
            </Link>
        </ProfileTippy>
    );
}
