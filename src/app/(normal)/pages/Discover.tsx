'use client';

import { Trans } from '@lingui/macro';
import { safeUnreachable } from '@masknet/kit';
import React, { type ComponentType, memo } from 'react';

import { DiscoverArticleList } from '@/components/Article/DiscoverArticleList.js';
import { ChannelList } from '@/components/Channel/ChannelList.js';
import { DiscoverNFTList } from '@/components/NFTs/DiscoverNFTList.js';
import { DiscoverPostList } from '@/components/Posts/DiscoverPostList.js';
import { ForYouPostList } from '@/components/Posts/ForYouPostList.js';
import { RecentPostList } from '@/components/Posts/RecentPostList.js';
import { DiscoverSnapshotList } from '@/components/Snapshot/DiscoverSnapshotList.js';
import SuggestedFollowUsersList from '@/components/SuggestedFollows/SuggestedFollowUsersList.js';
import {
    type DiscoverSource,
    DiscoverType,
    type SocialDiscoverSource,
    type SocialSource,
    Source,
} from '@/constants/enum.js';
import { Link } from '@/esm/Link.js';
import { classNames } from '@/helpers/classNames.js';
import { resolveDiscoverUrl } from '@/helpers/resolveDiscoverUrl.js';

interface Props {
    source: DiscoverSource;
    discover?: DiscoverType;
}

export function DiscoverPage({ source, discover = DiscoverType.Trending }: Props) {
    if (source === Source.Snapshot) {
        return <DiscoverSnapshotList />;
    }
    if (source === Source.Article) {
        return <DiscoverArticleList />;
    }

    if (source === Source.NFTs) {
        return <DiscoverNFTList />;
    }

    return <DiscoverContentList type={discover} source={source} />;
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
                        'flex h-6 cursor-pointer list-none justify-center rounded-md px-1.5 text-xs leading-6 lg:flex-initial lg:justify-start',
                        type === x
                            ? 'bg-highlight text-primaryBottom'
                            : 'bg-thirdMain text-second hover:text-highlight',
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
