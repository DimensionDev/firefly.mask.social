'use client';

import { Trans } from '@lingui/macro';
import { safeUnreachable } from '@masknet/kit';
import { useRouter } from 'next/navigation.js';
import React, { type ComponentType, memo, Suspense } from 'react';

import { DiscoverArticleList } from '@/components/Article/DiscoverArticleList.js';
import { ChannelList } from '@/components/Channel/ChannelList.js';
import { Loading } from '@/components/Loading.js';
import { DiscoverNFTList } from '@/components/NFTs/DiscoverNFTList.js';
import { DiscoverPostList } from '@/components/Posts/DiscoverPostList.js';
import { ForYouPostList } from '@/components/Posts/ForYouPostList.js';
import { RecentPostList } from '@/components/Posts/RecentPostList.js';
import SuggestedFollowUsersList from '@/components/SuggestedFollows/SuggestedFollowUsersList.js';
import { Tab, Tabs } from '@/components/Tabs/index.js';
import {
    type DiscoverSource,
    DiscoverType,
    type SocialDiscoverSource,
    type SocialSource,
    Source,
} from '@/constants/enum.js';
import { DISCOVER_SOURCE } from '@/constants/index.js';
import { resolveDiscoverUrl } from '@/helpers/resolveDiscoverUrl.js';
import { resolveSourceName } from '@/helpers/resolveSourceName.js';

interface Props {
    source: DiscoverSource;
    discover?: DiscoverType;
}

export function DiscoverPage({ source, discover = DiscoverType.Trending }: Props) {
    if (source === Source.Article) {
        return <DiscoverArticleList />;
    }

    if (source === Source.NFTs) {
        return <DiscoverNFTList />;
    }

    return (
        <Suspense fallback={<Loading />}>
            <DiscoverContentList type={discover} source={source} />
        </Suspense>
    );
}

export function DiscoverSourceTabs({ source }: { source: DiscoverSource }) {
    const router = useRouter();
    return (
        <div className="no-scrollbar sticky top-[54px] z-40 w-full overflow-x-auto overflow-y-hidden border-b border-line bg-primaryBottom px-4 md:top-0">
            <Tabs value={source} onChange={(x) => router.replace(resolveDiscoverUrl(x))}>
                {DISCOVER_SOURCE.map((x) => (
                    <Tab
                        key={x}
                        value={x}
                        className="!text-xl"
                        onMouseEnter={() => router.prefetch(resolveDiscoverUrl(x))}
                    >
                        {resolveSourceName(x)}
                    </Tab>
                ))}
            </Tabs>
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
    const router = useRouter();
    const labels: Record<DiscoverType, React.ReactNode> = {
        [DiscoverType.Trending]: <Trans>Trending</Trans>,
        [DiscoverType.ForYou]: <Trans>For You</Trans>,
        [DiscoverType.Recent]: <Trans>Recent</Trans>,
        [DiscoverType.TopProfiles]: <Trans>Top Profiles</Trans>,
        [DiscoverType.TopChannels]: <Trans>Top Channels</Trans>,
    };

    return (
        <Tabs
            className="px-1.5 pb-1.5 pt-3"
            variant="solid"
            onChange={(x) => router.replace(resolveDiscoverUrl(source, x))}
            value={type}
        >
            {types.map((type) => (
                <Tab value={type} key={type} onMouseEnter={() => router.prefetch(resolveDiscoverUrl(source, type))}>
                    {labels[type]}
                </Tab>
            ))}
        </Tabs>
    );
}

export const DiscoverContentList: ComponentType<{ type: DiscoverType; source: SocialSource }> = memo(
    function DiscoverContentList({ type, source }) {
        switch (type) {
            case DiscoverType.Trending:
                return <DiscoverPostList />;
            case DiscoverType.ForYou:
                return <ForYouPostList />;
            case DiscoverType.Recent:
                return <RecentPostList />;
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
