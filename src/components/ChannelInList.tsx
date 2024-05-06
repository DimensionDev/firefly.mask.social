import { isUndefined } from 'lodash-es';

import { Avatar } from '@/components/Avatar.js';
import { FollowButton } from '@/components/Channel/FollowButton.js';
import { SourceIcon } from '@/components/SourceIcon.js';
import { Link } from '@/esm/Link.js';
import { getChannelUrl } from '@/helpers/getChannelUrl.js';
import { useIsSmall } from '@/hooks/useMediaQuery.js';
import type { Channel } from '@/providers/types/SocialMedia.js';
import { useGlobalState } from '@/store/useGlobalStore.js';

interface ChannelInListProps {
    channel: Channel;
    noFollowButton?: boolean;
    listKey?: string;
    index?: number;
}

export function ChannelInList({ channel, noFollowButton = true, listKey, index }: ChannelInListProps) {
    const isSmall = useIsSmall('max');
    const setScrollIndex = useGlobalState.use.setScrollIndex();

    return (
        <div className="flex-start flex cursor-pointer overflow-auto border-b border-secondaryLine px-4 py-6 hover:bg-bg dark:border-line">
            <Link
                className="flex-start flex flex-1 overflow-auto"
                onClick={() => {
                    if (listKey && !isUndefined(index)) setScrollIndex(listKey, index);
                }}
                href={getChannelUrl(channel)}
            >
                <Avatar
                    className="mr-3 shrink-0 rounded-full border"
                    src={channel.imageUrl}
                    size={isSmall ? 40 : 78}
                    alt={channel.name}
                />

                <div className="flex-start flex flex-1 flex-col overflow-auto">
                    <p className="flex-start flex items-center text-sm font-bold leading-5 md:mt-2">
                        <span className="mr-2 text-xl">{channel.name}</span>
                        <SourceIcon source={channel.source} />
                    </p>
                    {channel.id ? <p className="text-sm text-secondary">/{channel.id}</p> : null}
                    {channel.description ? (
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
        </div>
    );
}
