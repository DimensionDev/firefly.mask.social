import { memo } from 'react';

import { ToggleMutedProfileButton } from '@/components/Actions/ToggleMutedProfileButton.js';
import { Avatar } from '@/components/Avatar.js';
import { SocialSourceIcon } from '@/components/SocialSourceIcon.js';
import { Source } from '@/constants/enum.js';
import { Link } from '@/esm/Link.js';
import { getLennyURL } from '@/helpers/getLennyURL.js';
import { getProfileUrl } from '@/helpers/getProfileUrl.js';
import type { Profile } from '@/providers/types/SocialMedia.js';

interface MutedProfileItemProps {
    profile: Profile;
}

export const MutedProfileItem = memo<MutedProfileItemProps>(function MutedProfileItem({ profile }) {
    return (
        <Link
            href={getProfileUrl(profile)}
            className="grid gap-2 border-b border-line p-3"
            style={{ gridTemplateColumns: '50px calc(100% - 50px - 100px - 16px) 100px' }}
        >
            <Avatar
                className="min-w-[50px] shrink-0"
                src={profile.pfp}
                size={50}
                alt={profile.profileId}
                fallbackUrl={profile.source === Source.Lens ? getLennyURL(profile.pfp) : undefined}
            />
            <div className="leading-5.5 flex flex-col text-[15px]">
                <div className="flex w-full items-center">
                    <div className="max-w-[calc(100% - 32px)] mr-2 truncate text-lg leading-6">
                        {profile.displayName}
                    </div>
                    <SocialSourceIcon
                        source={profile.source}
                        className={profile.source === Source.Lens ? 'dark:opacity-70' : undefined}
                    />
                </div>
                <div className="w-full truncate text-secondary">@{profile.handle}</div>
                <div className="w-full truncate">{profile.bio}</div>
            </div>
            <div className="flex shrink-0 justify-end">
                <ToggleMutedProfileButton profile={profile} />
            </div>
        </Link>
    );
});
