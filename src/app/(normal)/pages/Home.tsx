'use client';

import { t, Trans } from '@lingui/macro';
import { safeUnreachable } from '@masknet/kit';
import { type ComponentType, memo, Suspense, useEffect } from 'react';

import { DiscoverArticleList } from '@/components/Article/DiscoverArticleList.js';
import { ChannelList } from '@/components/Channel/ChannelList.js';
import { Loading } from '@/components/Loading.js';
import { DiscoverNFTList } from '@/components/NFTs/DiscoverNFTList.js';
import { DiscoverPostList } from '@/components/Posts/DiscoverPostList.js';
import { ForYouPostList } from '@/components/Posts/ForYouPostList.js';
import { RecentPostList } from '@/components/Posts/RecentPostList.js';
import SuggestedFollowUsersList from '@/components/SuggestedFollows/SuggestedFollowUsersList.js';
import { Tab, Tabs } from '@/components/Tabs/index.js';
import { DiscoverType, type SocialSource, Source, STATUS } from '@/constants/enum.js';
import { env } from '@/constants/env.js';
import { useCurrentProfile } from '@/hooks/useCurrentProfile.js';
import { useNavigatorTitle } from '@/hooks/useNavigatorTitle.js';
import { useStateWithSearchParams } from '@/hooks/useStateWithSearchParams.js';
import { useGlobalState } from '@/store/useGlobalStore.js';

const FARCASTER_TYPES_LOGGED = [
    DiscoverType.Trending,
    DiscoverType.ForYou,
    DiscoverType.TopProfiles,
    DiscoverType.TopChannels,
] as const;
const FARCASTER_TYPES = [DiscoverType.Trending, DiscoverType.TopProfiles, DiscoverType.TopChannels] as const;
const LENS_TYPES =
    env.external.NEXT_PUBLIC_OPENRANK === STATUS.Enabled
        ? [DiscoverType.Trending, DiscoverType.Recent, DiscoverType.TopProfiles]
        : ([DiscoverType.Trending, DiscoverType.TopProfiles] as const);

const ContentList: ComponentType<{ type: DiscoverType; source: SocialSource }> = memo(function ContentList({
    type,
    source,
}) {
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
});

export function HomePage() {
    const currentSource = useGlobalState.use.currentSource();
    const currentProfile = useCurrentProfile(Source.Farcaster);
    const [discoverType, setDiscoverType] = useStateWithSearchParams('discover', DiscoverType.Trending);

    const farcasterTypes =
        env.external.NEXT_PUBLIC_OPENRANK === STATUS.Enabled && currentProfile
            ? FARCASTER_TYPES_LOGGED
            : FARCASTER_TYPES;

    const tabLabels = {
        [DiscoverType.Trending]: <Trans>Trending</Trans>,
        [DiscoverType.ForYou]: <Trans>For You</Trans>,
        [DiscoverType.Recent]: <Trans>Recent</Trans>,
        [DiscoverType.TopProfiles]: <Trans>Top Profiles</Trans>,
        [DiscoverType.TopChannels]: <Trans>Top Channels</Trans>,
    };

    useNavigatorTitle(t`Discover`);

    useEffect(() => {
        switch (currentSource) {
            case Source.Farcaster:
                if (!farcasterTypes.includes(discoverType)) setDiscoverType(DiscoverType.Trending);
                break;
            case Source.Lens:
                if (!LENS_TYPES.includes(discoverType)) setDiscoverType(DiscoverType.Trending);
                break;
        }
    }, [currentSource, discoverType, farcasterTypes, setDiscoverType]);

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
                    {farcasterTypes.map((type) => (
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
