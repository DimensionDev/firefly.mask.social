import { Trans } from '@lingui/macro';

import { ProfileLink } from '@/components/Notification/ProfileLink.js';
import { UserListTippy } from '@/components/Notification/UserListTippy.js';
import type { Profile } from '@/providers/types/SocialMedia.js';

interface Props {
    profiles: Profile[];
}
export function ExtraProfiles({ profiles }: Props) {
    return (
        <Trans>
            <ProfileLink profile={profiles[0]} /> and{' '}
            <UserListTippy
                users={profiles.slice(1)}
                className="cursor-pointer underline hover:underline md:no-underline"
            >
                {profiles.length - 1} others
            </UserListTippy>
        </Trans>
    );
}
