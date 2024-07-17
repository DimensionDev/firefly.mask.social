import { memo } from 'react';

import { Avatar } from '@/components/Avatar.js';
import { FollowButton } from '@/components/Profile/FollowButton.js';
import { SocialSourceIcon } from '@/components/SocialSourceIcon.js';
import { Source } from '@/constants/enum.js';
import { Link } from '@/esm/Link.js';
import { getLennyURL } from '@/helpers/getLennyURL.js';
import { getProfileUrl } from '@/helpers/getProfileUrl.js';
import { useIsSmall } from '@/hooks/useMediaQuery.js';
import type { Profile } from '@/providers/types/SocialMedia.js';

export const FollowInList = memo<{ profile: Profile }>(function FollowInList({ profile }) {
    const isSmall = useIsSmall('max');
    return (
        <Link
            href={getProfileUrl(profile)}
            className="grid gap-2.5 border-b border-line py-3 pl-3 pr-5"
            style={{ gridTemplateColumns: '70px calc(100% - 70px - 100px - 20px) 100px' }}
        >
            <Avatar
                className="w-17.5 h-17.5 min-w-[70px] shrink-0"
                src={profile.pfp}
                size={isSmall ? 40 : 44}
                alt={profile.profileId}
                fallbackUrl={profile.source === Source.Lens ? getLennyURL(profile.pfp) : undefined}
            />
            <div className="leading-5.5 flex flex-col text-[15px]">
                <div className="flex w-full items-center">
                    <div className="max-w-[calc(100% - 32px)] mr-2 truncate text-xl leading-6">
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
                <FollowButton profile={profile} />
            </div>
        </Link>
    );
});

export function getFollowInList(index: number, profile: Profile) {
    return <FollowInList profile={profile} key={`${profile.profileId}-${index}`} />;
}
