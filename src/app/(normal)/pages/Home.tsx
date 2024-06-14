'use client';

import { t } from '@lingui/macro';
import { safeUnreachable } from '@masknet/kit';
import { type ComponentType, memo, Suspense } from 'react';

import { DiscoverArticleList } from '@/components/Article/DiscoverArticleList.js';
import { ChannelList } from '@/components/Channel/ChannelList.js';
import { Loading } from '@/components/Loading.js';
import { DiscoverNFTList } from '@/components/NFTs/DiscoverNFTList.js';
import { DiscoverPostList } from '@/components/Posts/DiscoverPostList.js';
import SuggestedFollowUsersList from '@/components/SuggestedFollows/SuggestedFollowUsersList.js';
import { Tab, Tabs } from '@/components/Tabs/index.js';
import { DiscoverType, type SocialSource, Source } from '@/constants/enum.js';
import { useNavigatorTitle } from '@/hooks/useNavigatorTitle.js';
import { useStateWithSearchParams } from '@/hooks/useStateWithSearchParams.js';
import { useGlobalState } from '@/store/useGlobalStore.js';

const ContentList: ComponentType<{ type: DiscoverType; source: SocialSource }> = memo(function ContentList({
    type,
    source,
}) {
    switch (type) {
        case DiscoverType.Trending:
            return <DiscoverPostList />;
        case DiscoverType.TopProfiles:
            return <SuggestedFollowUsersList source={source} />;
        case DiscoverType.TopChannels:
            return source === Source.Farcaster ? <ChannelList source={source} /> : null;
        default:
            safeUnreachable(type);
            return null;
    }
});

export function HomePage() {
    const currentSource = useGlobalState.use.currentSource();
    const [discoverType, setDiscoverType] = useStateWithSearchParams('discover', DiscoverType.Trending);

    useNavigatorTitle(t`Discover`);

    if (currentSource === Source.Article) {
        return <DiscoverArticleList />;
    }

    if (currentSource === Source.NFTs) {
        return <DiscoverNFTList />;
    }

    return (
        <div>
            {currentSource === Source.Farcaster ? (
                <Tabs
                    className="px-1.5 pb-1.5 pt-3"
                    variant="classification"
                    onChange={setDiscoverType}
                    value={discoverType}
                >
                    <Tab value={DiscoverType.Trending}>{t`Trending`}</Tab>
                    <Tab value={DiscoverType.TopProfiles}>{t`Top Profiles`}</Tab>
                    <Tab value={DiscoverType.TopChannels}>{t`Top Channels`}</Tab>
                </Tabs>
            ) : null}
            {currentSource === Source.Lens ? (
                <Tabs
                    className="px-1.5 pb-1.5 pt-3"
                    variant="classification"
                    onChange={setDiscoverType}
                    value={discoverType}
                >
                    <Tab value={DiscoverType.Trending}>{t`Trending`}</Tab>
                    <Tab value={DiscoverType.TopProfiles}>{t`Top Profiles`}</Tab>
                </Tabs>
            ) : null}
            <Suspense fallback={<Loading />}>
                <ContentList type={discoverType} source={currentSource as SocialSource} />
            </Suspense>
        </div>
    );
}
