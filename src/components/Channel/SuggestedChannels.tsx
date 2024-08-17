'use client';

import { Trans } from '@lingui/macro';
import { useQuery } from '@tanstack/react-query';
import urlcat from 'urlcat';

import { AsideTitle } from '@/components/AsideTitle.js';
import { ChannelInList } from '@/components/ChannelInList.js';
import { DiscoverType, PageRoute, type SocialSource, Source } from '@/constants/enum.js';
import { EMPTY_LIST } from '@/constants/index.js';
import { Link } from '@/esm/Link.js';
import { resolveSocialMediaProvider } from '@/helpers/resolveSocialMediaProvider.js';
import { resolveSocialSourceInURL } from '@/helpers/resolveSourceInURL.js';

const SHOW_LENGTH = 3;

interface SuggestedChannelsProps {
    source: SocialSource;
}

export function SuggestedChannels({ source }: SuggestedChannelsProps) {
    const { data, isLoading, isError } = useQuery({
        queryKey: ['suggest-channels', source],
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
        <div className="rounded-lg border border-line dark:border-0 dark:bg-lightBg">
            <AsideTitle>
                <Trans>Suggested Channels</Trans>
            </AsideTitle>
            <div className="flex flex-col">
                {suggestedChannels.map((channel) => (
                    <ChannelInList key={channel.id} channel={channel} noFollowButton dense />
                ))}
            </div>
            {showMore ? (
                <Link
                    href={urlcat(PageRoute.Home, {
                        discover: DiscoverType.TopChannels,
                        source: resolveSocialSourceInURL(Source.Farcaster),
                    })}
                    className="flex px-4 py-2 text-[15px] font-bold leading-[24px] text-lightHighlight"
                >
                    <Trans>Show More</Trans>
                </Link>
            ) : null}
        </div>
    );
}
