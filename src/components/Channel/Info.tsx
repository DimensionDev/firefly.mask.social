import { plural } from '@lingui/macro';

import { Avatar } from '@/components/Avatar.js';
import { FollowButton } from '@/components/Channel/FollowButton.js';
import { BioMarkup } from '@/components/Markup/BioMarkup.js';
import { SourceIcon } from '@/components/SourceIcon.js';
import type { SocialSource } from '@/constants/enum.js';
import { nFormatter } from '@/helpers/formatCommentCounts.js';
import { useIsMedium } from '@/hooks/useMediaQuery.js';
import type { Channel } from '@/providers/types/SocialMedia.js';

interface InfoProps {
    channel: Channel;
    source: SocialSource;
}

export function Info({ channel, source }: InfoProps) {
    const followerCount = channel.followerCount ?? 0;

    const isMedium = useIsMedium();

    return (
        <div className=" flex gap-3 p-3">
            {channel.imageUrl ? (
                <Avatar src={channel.imageUrl} alt="avatar" size={80} className=" h-20 w-20 rounded-full" />
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
                    <span className=" text-[15px] text-secondary">/{channel?.id}</span>
                </div>

                <BioMarkup className="text-[15px]">{channel?.description ?? '-'}</BioMarkup>

                <div className=" flex gap-3 text-[15px]">
                    <div className=" flex gap-1">
                        <span className=" font-bold text-lightMain">{nFormatter(followerCount)}</span>
                        <span className=" text-secondary">
                            {plural(followerCount, {
                                one: 'Follower',
                                other: 'Followers',
                            })}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
