import { isUndefined } from 'lodash-es';

import UserIcon from '@/assets/user.svg';
import { ToggleMutedChannelButton } from '@/components/Actions/ToggleMutedChannelButton.js';
import { Avatar } from '@/components/Avatar.js';
import { ChannelTippy } from '@/components/Channel/ChannelTippy.js';
import { FollowButton } from '@/components/Channel/FollowButton.js';
import { SocialSourceIcon } from '@/components/SocialSourceIcon.js';
import { Link } from '@/esm/Link.js';
import { classNames } from '@/helpers/classNames.js';
import { nFormatter } from '@/helpers/formatCommentCounts.js';
import { getChannelUrl } from '@/helpers/getChannelUrl.js';
import { useIsSmall } from '@/hooks/useMediaQuery.js';
import type { Channel } from '@/providers/types/SocialMedia.js';
import { useGlobalState } from '@/store/useGlobalStore.js';

interface ChannelInListProps {
    channel: Channel;
    listKey?: string;
    index?: number;
    dense?: boolean;
    noFollowButton?: boolean;
    noMuteButton?: boolean;
}

export function ChannelInList({
    channel,
    noFollowButton = true,
    noMuteButton = true,
    dense = false,
    listKey,
    index,
}: ChannelInListProps) {
    const isSmall = useIsSmall('max');
    const setScrollIndex = useGlobalState.use.setScrollIndex();

    return (
        <div
            className={classNames(
                'flex-start flex cursor-pointer overflow-auto border-secondaryLine hover:bg-bg dark:border-line',
                {
                    'border-b px-4 py-6': !dense,
                    'px-4 py-2': dense,
                },
            )}
        >
            <Link
                className="flex-start flex flex-1 items-center overflow-auto"
                onClick={() => {
                    if (listKey && !isUndefined(index)) setScrollIndex(listKey, index);
                }}
                href={getChannelUrl(channel)}
            >
                <ChannelTippy channel={channel}>
                    <Avatar
                        className="mr-3 shrink-0 rounded-full border"
                        src={channel.imageUrl}
                        size={isSmall || dense ? 40 : 70}
                        alt={channel.name}
                    />
                </ChannelTippy>

                <div className="flex-start flex flex-1 flex-col overflow-auto">
                    <p className="flex-start flex items-center text-sm font-bold leading-5">
                        <ChannelTippy channel={channel}>
                            <span
                                className={classNames('mr-2', {
                                    'text-xl': !dense,
                                    'text-l': dense,
                                })}
                            >
                                {channel.name}
                            </span>
                        </ChannelTippy>
                        <SocialSourceIcon source={channel.source} size={isSmall || dense ? 16 : 20} />
                    </p>
                    <div className="flex items-center gap-2 text-[15px] text-sm leading-[24px] text-secondary">
                        <ChannelTippy channel={channel}>
                            <p className="truncate">/{channel.id}</p>
                        </ChannelTippy>
                        <UserIcon
                            width={isSmall || dense ? 14 : 18}
                            height={isSmall || dense ? 14 : 18}
                            className="shrink-0"
                        />
                        <span>{nFormatter(channel.followerCount)}</span>
                    </div>
                    {!dense && channel.description ? (
                        <p
                            className="mt-1.5 overflow-hidden text-ellipsis whitespace-nowrap text-sm"
                            title={channel.description}
                        >
                            {channel.description}
                        </p>
                    ) : null}
                </div>
            </Link>

            {!noFollowButton ? (
                <div>
                    <FollowButton channel={channel} />
                </div>
            ) : null}

            {!noMuteButton ? (
                <div>
                    <ToggleMutedChannelButton channel={channel} />
                </div>
            ) : null}
        </div>
    );
}
