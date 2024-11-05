'use client';

import { safeUnreachable } from '@masknet/kit';
import { type ComponentType, memo } from 'react';

import { ChannelList } from '@/components/Channel/ChannelList.js';
import SuggestedFollowUsersList from '@/components/SuggestedFollows/SuggestedFollowUsersList.js';
import { type ExploreSource, ExploreType, Source } from '@/constants/enum.js';

interface Props {
    source: ExploreSource;
    type: ExploreType;
}

export function ExplorePage({ source, type }: Props) {
    return <ExploreContentList source={source} type={type} />;
}

export const ExploreContentList: ComponentType<{ type: ExploreType; source: ExploreSource }> = memo(
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
