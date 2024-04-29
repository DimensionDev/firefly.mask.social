import {  memo } from 'react';

import { Avatar } from '@/components/Avatar.js';
import { FollowButton } from '@/components/Profile/FollowButton.js';
import { SocialPlatform } from '@/constants/enum.js';
import { getLennyURL } from '@/helpers/getLennyURL.js';
import type { Profile } from '@/providers/types/SocialMedia.js';

export const FollowInList = memo<{ profile: Profile }>(function FollowInList({ profile }) {
    return (
        <div className="pl-3 py-3 pr-5 grid gap-2.5 border-b border-line" style={{ gridTemplateColumns: '70px calc(100% - 70px - 100px - 20px) 100px' }}>
            <Avatar
                className="w-17.5 h-17.5 min-w-[70px] shrink-0"
                src={profile.pfp}
                size={70}
                alt={profile.profileId}
                fallbackUrl={profile.source === SocialPlatform.Lens ? getLennyURL(profile.pfp) : undefined}
            />
            <div className="flex flex-col text-[15px] leading-5.5">
                <div className="text-xl leading-6 truncate w-full">{profile.displayName}</div>
                <div className="text-secondary truncate w-full">@{profile.handle}</div>
                <div className="truncate w-full">{profile.bio}</div>
            </div>
            <div className="shrink-0 flex justify-end">
                <FollowButton profile={profile}/>
            </div>
        </div>
    )
})

export function getFollowInList(index: number, profile: Profile) {
    return <FollowInList profile={profile} key={`${profile.profileId}-${index}`} />;
}
