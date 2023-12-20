import { Trans } from '@lingui/macro';
import { useMemo } from 'react';

import { Avatar } from '@/components/Avatar.js';
import FollowButton from '@/components/Profile/FollowButton.js';
import { SourceIcon } from '@/components/SourceIcon.js';
import type { Profile } from '@/providers/types/SocialMedia.js';
import { useGlobalState } from '@/store/useGlobalStore.js';

interface InfoProps {
    isMyProfile: boolean;
    profile?: Profile;
}

export default function Info({ isMyProfile, profile }: InfoProps) {
    const currentSource = useGlobalState.use.currentSource();

    const followingCount = useMemo(() => profile?.followingCount ?? 0, [profile?.followingCount]);

    const followerCount = useMemo(() => profile?.followerCount ?? 0, [profile?.followerCount]);

    return (
        <div className=" flex gap-3 p-3">
            {profile?.pfp ? (
                <Avatar src={profile.pfp} alt="avatar" size={80} className=" h-20 w-20 rounded-full" />
            ) : (
                <SourceIcon className="rounded-full" source={currentSource} size={80} />
            )}

            <div className=" relative flex flex-1 flex-col gap-[6px] pt-4">
                {!isMyProfile && profile ? (
                    <div className=" absolute right-0 top-4">
                        <FollowButton profile={profile} />
                    </div>
                ) : null}

                <div className=" flex flex-col">
                    <div className=" flex items-center gap-2">
                        <span className=" text-xl font-black text-lightMain">{profile?.displayName}</span>
                        <SourceIcon source={currentSource} size={20} />
                    </div>
                    <span className=" text-[15px] text-secondary">@{profile?.handle}</span>
                </div>

                <div>{profile?.bio ?? '-'}</div>

                <div className=" flex gap-3 text-[15px]">
                    <div className=" flex gap-1">
                        <span className=" font-bold text-lightMain">{followingCount}</span>
                        <span className=" text-secondary">
                            {followingCount === 1 ? <Trans>Following</Trans> : <Trans>Followings</Trans>}
                        </span>
                    </div>

                    <div className=" flex gap-1">
                        <span className=" font-bold text-lightMain">{followerCount}</span>
                        <span className=" text-secondary">
                            {followerCount === 1 ? <Trans>Follower</Trans> : <Trans>Followers</Trans>}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
