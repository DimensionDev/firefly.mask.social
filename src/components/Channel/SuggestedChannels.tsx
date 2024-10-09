'use client';

import { Trans } from '@lingui/macro';
import { useQuery } from '@tanstack/react-query';
import urlcat from 'urlcat';

import { AsideTitle } from '@/components/AsideTitle.js';
import { ChannelInList } from '@/components/ChannelInList.js';
import { DiscoverType, type SocialSource, Source } from '@/constants/enum.js';
import { EMPTY_LIST } from '@/constants/index.js';
import { Link } from '@/esm/Link.js';
import { resolveSocialMediaProvider } from '@/helpers/resolveSocialMediaProvider.js';
import { resolveSocialSourceInUrl } from '@/helpers/resolveSourceInUrl.js';

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

    const channels = data?.data?.filter((channel) => !channel.blocked) ?? EMPTY_LIST;
    const showMore = channels.length > SHOW_LENGTH;
    const suggestedChannels = channels.slice(0, SHOW_LENGTH);

    if (!suggestedChannels.length) return null;

    return (
        <section>
            <AsideTitle className="flex items-center justify-between">
                <span className="text-xl">
                    <Trans>Trending Channels</Trans>
                </span>
                {showMore ? (
                    <Link
                        className="text-medium text-lightHighlight"
                        href={urlcat('/', {
                            discover: DiscoverType.TopChannels,
                            source: resolveSocialSourceInUrl(Source.Farcaster),
                        })}
                    >
                        <Trans>More</Trans>
                    </Link>
                ) : null}
            </AsideTitle>
            <div className="flex flex-col rounded-xl bg-lightBg py-[18px]">
                {suggestedChannels.map((channel) => (
                    <ChannelInList key={channel.id} channel={channel} noFollowButton dense />
                ))}
            </div>
        </section>
    );
}
