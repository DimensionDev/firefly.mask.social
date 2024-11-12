'use client';

import { safeUnreachable } from '@masknet/kit';
import { type ComponentType, memo } from 'react';

import { ChannelList } from '@/components/Channel/ChannelList.js';
import SuggestedFollowUsersList from '@/components/SuggestedFollows/SuggestedFollowUsersList.js';
import { TokenTrendingList } from '@/components/TokenTrendingList.js';
import { type ExploreSource, ExploreType, type SocialSource, Source, TrendingType } from '@/constants/enum.js';

interface Props {
    source: ExploreSource;
    type: ExploreType;
}

export function ExplorePage({ source, type }: Props) {
    if (type === ExploreType.CryptoTrends) {
        return <TokenTrendingList type={source as TrendingType} />;
    } else {
        return <ExploreContentList source={source as SocialSource} type={type} />;
    }
}

export const ExploreContentList: ComponentType<{ type: ExploreType; source: SocialSource }> = memo(
    function ExploreContentList({ type, source }) {
        switch (type) {
            case ExploreType.TopProfiles:
                return <SuggestedFollowUsersList source={source} />;
            case ExploreType.TopChannels:
                return source === Source.Farcaster ? <ChannelList source={source} /> : null;
            case ExploreType.CryptoTrends:
                return null;
            default:
                safeUnreachable(type);
                return null;
        }
    },
);
