import { Plural } from '@lingui/macro';
import { isUndefined } from 'lodash-es';

import { ToggleMutedChannelButton } from '@/components/Actions/ToggleMutedChannelButton.js';
import { Avatar } from '@/components/Avatar.js';
import { ChannelTippy } from '@/components/Channel/ChannelTippy.js';
import { FollowButton } from '@/components/Channel/FollowButton.js';
import { BioMarkup } from '@/components/Markup/BioMarkup.js';
import { PlainParagraph, VoidLineBreak } from '@/components/Markup/overrides.js';
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

const overrideComponents = {
    p: PlainParagraph,
    br: VoidLineBreak,
};
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
                'flex-start flex cursor-pointer overflow-auto border-b-lightLineSecond hover:bg-bg dark:border-line',
                {
                    'border-b p-3': !dense,
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
                <div className="mr-[10px] shrink-0 self-start">
                    <ChannelTippy channel={channel}>
                        <Avatar
                            className="rounded-full border"
                            src={channel.imageUrl}
                            size={isSmall || dense ? 40 : 44}
                            alt={channel.name}
                        />
                    </ChannelTippy>
                </div>

                <div className="flex-start flex max-w-[calc(100%-40px-16px)] flex-1 flex-col overflow-auto">
                    <div className="flex-start flex items-center gap-1 text-sm font-bold leading-5">
                        <ChannelTippy channel={channel} className="mr-1 truncate">
                            <span className="text-[18px] leading-6">{channel.name}</span>
                        </ChannelTippy>
                        <SocialSourceIcon
                            mono
                            source={channel.source}
                            size={16}
                            className="flex-shrink-0 text-secondary"
                        />
                    </div>
                    <div className="flex items-center gap-2 text-medium text-sm leading-[24px] text-secondary">
                        <ChannelTippy channel={channel}>
                            <p className="truncate text-[15px] leading-[22px]">/{channel.id}</p>
                        </ChannelTippy>
                        <span className="leading-[22px] text-secondary">·</span>
                        <data value={channel.followerCount}>
                            <span className="font-bold leading-[22px] text-lightMain">
                                {nFormatter(channel.followerCount)}{' '}
                            </span>
                            <span className="leading-[22px] text-secondary">
                                <Plural value={channel.followerCount} one="Member" other="Members" />
                            </span>
                        </data>
                    </div>
                    {!dense && channel.description ? (
                        <BioMarkup
                            className="mt-1.5 truncate text-sm"
                            components={overrideComponents}
                            source={channel.source}
                        >
                            {channel.description ?? '-'}
                        </BioMarkup>
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
