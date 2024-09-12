'use client';

import { Trans } from '@lingui/macro';
import { safeUnreachable } from '@masknet/kit';
import React, { type ComponentType, memo, Suspense } from 'react';

import { DiscoverArticleList } from '@/components/Article/DiscoverArticleList.js';
import { ChannelList } from '@/components/Channel/ChannelList.js';
import { Loading } from '@/components/Loading.js';
import { DiscoverNFTList } from '@/components/NFTs/DiscoverNFTList.js';
import { DiscoverPostList } from '@/components/Posts/DiscoverPostList.js';
import { ForYouPostList } from '@/components/Posts/ForYouPostList.js';
import { RecentPostList } from '@/components/Posts/RecentPostList.js';
import SuggestedFollowUsersList from '@/components/SuggestedFollows/SuggestedFollowUsersList.js';
import {
    type DiscoverSource,
    DiscoverType,
    type SocialDiscoverSource,
    type SocialSource,
    Source,
} from '@/constants/enum.js';
import { DISCOVER_SOURCE } from '@/constants/index.js';
import { Link } from '@/esm/Link.js';
import { classNames } from '@/helpers/classNames.js';
import { resolveDiscoverUrl } from '@/helpers/resolveDiscoverUrl.js';
import { resolveSourceName } from '@/helpers/resolveSourceName.js';

interface Props {
    source: DiscoverSource;
    discover?: DiscoverType;
}

export function DiscoverPage({ source, discover = DiscoverType.Trending }: Props) {
    if (source === Source.Article) {
        return (
            <Suspense fallback={<Loading />}>
                <DiscoverArticleList />
            </Suspense>
        );
    }

    if (source === Source.NFTs) {
        return (
            <Suspense fallback={<Loading />}>
                <DiscoverNFTList />
            </Suspense>
        );
    }

    return (
        <Suspense fallback={<Loading />}>
            <DiscoverContentList type={discover} source={source} />
        </Suspense>
    );
}

export function DiscoverSourceTabs({ source }: { source: DiscoverSource }) {
    return (
        <div className="no-scrollbar sticky top-[54px] z-40 w-full overflow-x-auto overflow-y-hidden border-b border-line bg-primaryBottom px-4 md:top-0">
            <nav className="flex space-x-4 text-xl" aria-label="Tabs">
                {DISCOVER_SOURCE.map((x) => (
                    <Link
                        key={x}
                        type={x}
                        href={resolveDiscoverUrl(x)}
                        className={classNames(
                            'h-[43px] cursor-pointer border-b-2 px-4 text-center font-bold leading-[43px] hover:text-main md:h-[60px] md:py-[18px] md:leading-6',
                            x === source ? 'border-farcasterPrimary text-main' : 'border-transparent text-third',
                        )}
                        aria-current={source === x ? 'page' : undefined}
                    >
                        {resolveSourceName(x)}
                    </Link>
                ))}
            </nav>
        </div>
    );
}

export function DiscoverTypeTabs({
    type,
    types,
    source,
}: {
    type: DiscoverType;
    types: DiscoverType[];
    source: SocialDiscoverSource;
}) {
    const labels: Record<DiscoverType, React.ReactNode> = {
        [DiscoverType.Trending]: <Trans>Trending</Trans>,
        [DiscoverType.ForYou]: <Trans>For You</Trans>,
        [DiscoverType.Recent]: <Trans>Recent</Trans>,
        [DiscoverType.TopProfiles]: <Trans>Top Profiles</Trans>,
        [DiscoverType.TopChannels]: <Trans>Top Channels</Trans>,
    };

    return (
        <nav className="flex space-x-2 px-1.5 pb-1.5 pt-3" aria-label="Tabs">
            {types.map((x) => (
                <Link
                    key={x}
                    href={resolveDiscoverUrl(source, x)}
                    replace
                    className={classNames(
                        'flex h-6 cursor-pointer list-none justify-center rounded-md bg-farcasterPrimary px-1.5 text-xs leading-6 lg:flex-initial lg:justify-start',
                        type === x
                            ? 'text-bg dark:text-white'
                            : 'bg-opacity-10 text-farcasterPrimary dark:bg-opacity-30 dark:text-white',
                    )}
                    aria-current={type === x ? 'page' : undefined}
                >
                    {labels[x]}
                </Link>
            ))}
        </nav>
    );
}

export const DiscoverContentList: ComponentType<{ type: DiscoverType; source: SocialSource }> = memo(
    function DiscoverContentList({ type, source }) {
        switch (type) {
            case DiscoverType.Trending:
                return <DiscoverPostList source={source} />;
            case DiscoverType.ForYou:
                return <ForYouPostList source={source} />;
            case DiscoverType.Recent:
                return <RecentPostList source={source} />;
            case DiscoverType.TopProfiles:
                return <SuggestedFollowUsersList source={source} />;
            case DiscoverType.TopChannels:
                return source === Source.Farcaster ? <ChannelList source={source} /> : null;
            default:
                safeUnreachable(type);
                return null;
        }
    },
);
