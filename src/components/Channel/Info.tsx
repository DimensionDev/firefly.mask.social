import { Trans } from '@lingui/macro';

import { Avatar } from '@/components/Avatar.js';
import { FollowButton } from '@/components/Channel/FollowButton.js';
import { BioMarkup } from '@/components/Markup/index.js';
import { SourceIcon } from '@/components/SourceIcon.js';
import type { SocialPlatform } from '@/constants/enum.js';
import { useIsMedium } from '@/hooks/useMediaQuery.js';
import type { Channel } from '@/providers/types/SocialMedia.js';

interface InfoProps {
    channel?: Channel;
    source: SocialPlatform;
}

export function Info({ channel: channel, source }: InfoProps) {
    const followingCount = channel?.lead?.following ?? 0;
    const followerCount = channel?.lead?.followers ?? 0;

    const isMedium = useIsMedium();

    return (
        <div className=" flex gap-3 p-3">
            {channel?.lead?.pfp ? (
                <Avatar src={channel.lead?.pfp} alt="avatar" size={80} className=" h-20 w-20 rounded-full" />
            ) : (
                <SourceIcon className="rounded-full" source={source} size={80} />
            )}

            <div className=" relative flex flex-1 flex-col gap-[6px] pt-4">
                {channel && isMedium ? (
                    <div className=" absolute right-0 top-4">
                        <FollowButton channel={channel} />
                    </div>
                ) : null}

                <div className=" flex flex-col">
                    <div className=" flex items-center gap-2">
                        <span className=" text-xl font-black text-lightMain">{channel?.name}</span>
                        <SourceIcon source={source} size={20} />
                    </div>
                    <span className=" text-[15px] text-secondary">@{channel?.id}</span>
                </div>

                <BioMarkup className="text-[15px]">{channel?.description ?? '-'}</BioMarkup>

                <div className=" flex gap-3 text-[15px]">
                    <div className=" flex gap-1">
                        <span className=" font-bold text-lightMain">{followingCount}</span>
                        <span className=" text-secondary">
                            {channel?.lead?.isFollowing ? <Trans>Following</Trans> : <Trans>Followings</Trans>}
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
