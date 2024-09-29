import { memo } from 'react';

import { ToggleMutedProfileButton } from '@/components/Actions/ToggleMutedProfileButton.js';
import { ProfileAvatar } from '@/components/ProfileAvatar.js';
import { SocialSourceIcon } from '@/components/SocialSourceIcon.js';
import { Source } from '@/constants/enum.js';
import { Link } from '@/esm/Link.js';
import { classNames } from '@/helpers/classNames.js';
import { getProfileUrl } from '@/helpers/getProfileUrl.js';
import type { Profile } from '@/providers/types/SocialMedia.js';

interface MutedProfileItemProps {
    profile: Profile;
}

export const MutedProfileItem = memo<MutedProfileItemProps>(function MutedProfileItem({ profile }) {
    const profileUrl = getProfileUrl(profile);

    return (
        <div
            className="grid gap-2 border-b border-line p-3"
            style={{ gridTemplateColumns: '50px calc(100% - 50px - 112px - 16px) 112px' }}
        >
            <ProfileAvatar
                className="min-w-[50px] shrink-0"
                linkable
                enableSourceIcon={false}
                profile={profile}
                size={50}
            />
            <div className="leading-5.5 flex flex-col text-medium">
                <div className="flex w-full items-center">
                    <Link href={profileUrl} className="max-w-[calc(100% - 32px)] mr-2 truncate text-lg leading-6">
                        {profile.displayName}
                    </Link>
                    <SocialSourceIcon
                        source={profile.source}
                        className={classNames('shrink-0', {
                            'dark:opacity-70': profile.source === Source.Lens,
                        })}
                    />
                </div>
                <Link href={profileUrl} className="w-full truncate text-secondary">
                    @{profile.handle}
                </Link>
                <div className="w-full truncate">{profile.bio}</div>
            </div>
            <div className="flex shrink-0 justify-end" onClick={(ev) => ev.stopPropagation()}>
                <ToggleMutedProfileButton profile={profile} />
            </div>
        </div>
    );
});
