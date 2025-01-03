'use client';

import { t } from '@lingui/macro';
import { safeUnreachable } from '@masknet/kit';

import { ChannelList } from '@/components/Channel/ChannelList.js';
import SuggestedFollowUsersList from '@/components/SuggestedFollows/SuggestedFollowUsersList.js';
import { TokenTrendingList } from '@/components/TokenTrendingList.js';
import { type ExploreSource, ExploreType, type SocialSource, Source, TrendingType } from '@/constants/enum.js';
import { useNavigatorTitle } from '@/hooks/useNavigatorTitle.js';

interface Props {
    source: ExploreSource;
    type: ExploreType;
}

export function ExplorePage({ source, type }: Props) {
    useNavigatorTitle(t`Explore`);

    switch (type) {
        case ExploreType.TopProfiles:
            return <SuggestedFollowUsersList source={source as SocialSource} />;
        case ExploreType.TopChannels:
            return source === Source.Farcaster ? <ChannelList source={source} /> : null;
        case ExploreType.CryptoTrends:
            return <TokenTrendingList type={source as TrendingType} />;
        case ExploreType.Projects:
            return null;
        default:
            safeUnreachable(type);
            return null;
    }
}
