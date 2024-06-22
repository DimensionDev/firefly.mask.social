'use client';

import { t, Trans } from '@lingui/macro';
import { safeUnreachable } from '@masknet/kit';
import { type ComponentType, memo, Suspense, useEffect } from 'react';

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

const FARCASTER_TYPES = [DiscoverType.Trending, DiscoverType.TopProfiles, DiscoverType.TopChannels] as const;
const LENS_TYPES = [DiscoverType.Trending, DiscoverType.TopProfiles] as const;

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

    const tabLabels = {
        [DiscoverType.Trending]: <Trans>Trending</Trans>,
        [DiscoverType.TopProfiles]: <Trans>Top Profiles</Trans>,
        [DiscoverType.TopChannels]: <Trans>Top Channels</Trans>,
    };

    useNavigatorTitle(t`Discover`);

    useEffect(() => {
        switch (currentSource) {
            case Source.Farcaster:
                if (!FARCASTER_TYPES.includes(discoverType)) setDiscoverType(DiscoverType.Trending);
                break;
            case Source.Lens:
                if (!LENS_TYPES.includes(discoverType)) setDiscoverType(DiscoverType.Trending);
                break;
        }
    }, [currentSource, discoverType, setDiscoverType]);

    if (currentSource === Source.Article) {
        return <DiscoverArticleList />;
    }

    if (currentSource === Source.NFTs) {
        return <DiscoverNFTList />;
    }

    return (
        <div>
            {currentSource === Source.Farcaster ? (
                <Tabs className="px-1.5 pb-1.5 pt-3" variant="solid" onChange={setDiscoverType} value={discoverType}>
                    {FARCASTER_TYPES.map((type) => (
                        <Tab value={type} key={type}>
                            {tabLabels[type]}
                        </Tab>
                    ))}
                </Tabs>
            ) : null}
            {currentSource === Source.Lens ? (
                <Tabs
                    className="px-1.5 pb-1.5 pt-3"
                    variant="solid"
                    onChange={(type) => {
                        setDiscoverType(type);
                        window.scroll(0, 0);
                    }}
                    value={discoverType}
                >
                    {LENS_TYPES.map((type) => (
                        <Tab value={type} key={type}>
                            {tabLabels[type]}
                        </Tab>
                    ))}
                </Tabs>
            ) : null}
            <Suspense fallback={<Loading />}>
                <ContentList type={discoverType} source={currentSource as SocialSource} />
            </Suspense>
        </div>
    );
}
