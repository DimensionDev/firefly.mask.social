import { memo } from 'react';

import { Avatar } from '@/components/Avatar.js';
import { FollowButton } from '@/components/Profile/FollowButton.js';
import { SourceIcon } from '@/components/SourceIcon.js';
import { SocialPlatform } from '@/constants/enum.js';
import { Link } from '@/esm/Link.js';
import { getLennyURL } from '@/helpers/getLennyURL.js';
import { resolveSourceInURL } from '@/helpers/resolveSourceInURL.js';
import type { Profile } from '@/providers/types/SocialMedia.js';

export const FollowInList = memo<{ profile: Profile }>(function FollowInList({ profile }) {
    return (
        <Link
            href={{
                pathname: `/profile/${profile?.profileId}`,
                query: { source: resolveSourceInURL(profile.source) },
            }}
            className="grid gap-2.5 border-b border-line py-3 pl-3 pr-5"
            style={{ gridTemplateColumns: '70px calc(100% - 70px - 100px - 20px) 100px' }}
        >
            <Avatar
                className="w-17.5 h-17.5 min-w-[70px] shrink-0"
                src={profile.pfp}
                size={70}
                alt={profile.profileId}
                fallbackUrl={profile.source === SocialPlatform.Lens ? getLennyURL(profile.pfp) : undefined}
            />
            <div className="leading-5.5 flex flex-col text-[15px]">
                <div className="flex w-full items-center">
                    <div className="mr-2 truncate text-xl leading-6 max-w-[calc(100% - 32px)]">
                        {profile.displayName}
                    </div>
                    <SourceIcon
                        source={profile.source}
                        className={profile.source === SocialPlatform.Lens ? 'dark:opacity-70' : undefined}
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
