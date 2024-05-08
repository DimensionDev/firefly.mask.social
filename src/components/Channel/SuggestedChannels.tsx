'use client';

import { Trans } from '@lingui/macro';
import { useQuery } from '@tanstack/react-query';
import React from 'react';

import UserIcon from '@/assets/user.svg';
import { Avatar } from '@/components/Avatar.js';
import { SocialSourceIcon } from '@/components/SocialSourceIcon.js';
import { PageRoute, type SocialSource } from '@/constants/enum.js';
import { EMPTY_LIST } from '@/constants/index.js';
import { Link } from '@/esm/Link.js';
import { nFormatter } from '@/helpers/formatCommentCounts.js';
import { getChannelUrl } from '@/helpers/getChannelUrl.js';
import { resolveSocialMediaProvider } from '@/helpers/resolveSocialMediaProvider.js';

const SHOW_LENGTH = 3;

export interface SuggestedChannelsProps {
    source: SocialSource;
}
export function SuggestedChannels({ source }: SuggestedChannelsProps) {
    const { data, isLoading, isError } = useQuery({
        queryKey: ['sugguest-channels', source],
        queryFn: async () => {
            return resolveSocialMediaProvider(source).discoverChannels();
        },
    });

    if (isError || isLoading) return null;

    const channels = data?.data ?? EMPTY_LIST;
    const showMore = channels.length > SHOW_LENGTH;
    const suggestedChannels = channels.slice(0, SHOW_LENGTH);

    if (!suggestedChannels.length) return null;

    return (
        <div className="border-r-2 bg-lightBg px-3 py-3">
            <p className="py-[6px] text-2xl font-bold leading-none">
                <Trans>Suggested Channels</Trans>
            </p>
            <div className="mt-3 flex flex-col gap-3">
                {suggestedChannels.map((channel) => (
                    <div className="flex-start flex cursor-pointer overflow-auto  hover:bg-bg " key={channel.id}>
                        <Link className="flex-start flex flex-1 overflow-auto" href={getChannelUrl(channel)}>
                            <Avatar
                                className="mr-3 shrink-0 rounded-full border"
                                src={channel.imageUrl}
                                size={48}
                                alt={channel.name}
                            />
                            <div className="flex-start flex flex-1 flex-col overflow-auto">
                                <p className="flex-start flex items-center">
                                    <span className="mr-2 truncate text-xl leading-[24px]">{channel.name}</span>
                                    <SocialSourceIcon source={channel.source} className="shrink-0" />
                                </p>
                                <div className="flex items-center gap-2 text-[15px] text-sm leading-[24px] text-secondary">
                                    <p className="truncate">/{channel.id}</p>
                                    <UserIcon width={18} height={18} className="shrink-0" />
                                    <span>{nFormatter(channel.followerCount)}</span>
                                </div>
                            </div>
                        </Link>
                    </div>
                ))}
            </div>
            {showMore ? (
                <Link
                    href={PageRoute.ChannelTrending}
                    className="mt-[6px] flex text-[15px] font-bold leading-[24px] text-[#9250FF]"
                >
                    <Trans>Show More</Trans>
                </Link>
            ) : null}
        </div>
    );
}
