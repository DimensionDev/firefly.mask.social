import { Trans } from '@lingui/macro';
import { Suspense, useState } from 'react';

import { ClickableButton } from '@/components/ClickableButton.js';
import { Loading } from '@/components/Loading.js';
import { ChannelList } from '@/components/Profile/ChannelList.js';
import { CollectedList } from '@/components/Profile/CollectedList.js';
import { FeedList } from '@/components/Profile/FeedList.js';
import { SocialPlatform } from '@/constants/enum.js';
import { classNames } from '@/helpers/classNames.js';
import { safeUnreachable } from '@masknet/kit';

enum TabType {
    Feed = 'Feed',
    Collected = 'Collected',
    Channels = 'Channels',
}

interface TabsProps {
    profileId: string;
    source: SocialPlatform;
}

function TabTypeI18N({ type }: { type: TabType }) {
    switch (type) {
        case TabType.Feed:
            return <Trans>Feed</Trans>;
        case TabType.Collected:
            return <Trans>Collected</Trans>;
        case TabType.Channels:
            return <Trans>Channels</Trans>;
        default:
            safeUnreachable(type);
            return null;
    }
}

export function Tabs({ profileId, source }: TabsProps) {
    const [currentTab, setCurrentTab] = useState(TabType.Feed);

    const computedCurrentTab =
        (source === SocialPlatform.Lens && currentTab === TabType.Channels) ||
        (source === SocialPlatform.Farcaster && currentTab === TabType.Collected)
            ? TabType.Feed
            : currentTab;

    return (
        <>
            <div className=" flex gap-5 border-b border-lightLineSecond px-5 dark:border-line">
                {Object.values(TabType)
                    .filter((x) => {
                        if (source === SocialPlatform.Lens) return x !== TabType.Channels;
                        if (source === SocialPlatform.Farcaster) return x !== TabType.Collected;
                        return true;
                    })
                    .map((tab) => (
                        <div key={tab} className=" flex flex-col">
                            <ClickableButton
                                className={classNames(
                                    ' flex h-[46px] items-center px-[14px] font-extrabold transition-all',
                                    computedCurrentTab === tab ? ' text-main' : ' text-third hover:text-main',
                                )}
                                onClick={() => setCurrentTab(tab)}
                            >
                                <TabTypeI18N type={tab} />
                            </ClickableButton>
                            <span
                                className={classNames(
                                    ' h-1 w-full rounded-full bg-[#9250FF] transition-all',
                                    computedCurrentTab !== tab ? ' hidden' : '',
                                )}
                            />
                        </div>
                    ))}
            </div>

            {computedCurrentTab === TabType.Feed && (
                <Suspense fallback={<Loading />}>
                    <FeedList source={source} profileId={profileId} />
                </Suspense>
            )}

            {computedCurrentTab === TabType.Collected && source !== SocialPlatform.Farcaster && (
                <Suspense fallback={<Loading />}>
                    <CollectedList source={source} profileId={profileId} />
                </Suspense>
            )}

            {computedCurrentTab === TabType.Channels && source !== SocialPlatform.Lens && (
                <Suspense fallback={<Loading />}>
                    <ChannelList source={source} profileId={profileId} />
                </Suspense>
            )}
        </>
    );
}
