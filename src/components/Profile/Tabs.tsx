import { Trans } from '@lingui/macro';
import { safeUnreachable } from '@masknet/kit';
import { memo, Suspense, useState } from 'react';

import { ChannelList } from '@/components/ChannelList.js';
import { ClickableButton } from '@/components/ClickableButton.js';
import { Loading } from '@/components/Loading.js';
import { CollectedList } from '@/components/Profile/CollectedList.js';
import { FeedList } from '@/components/Profile/FeedList.js';
import { ProfileTabType, SocialPlatform } from '@/constants/enum.js';
import { SORTED_PROFILE_TAB_TYPE } from '@/constants/index.js';
import { classNames } from '@/helpers/classNames.js';

const ContentList = memo(function ContentList({
    type,
    source,
    profileId,
}: {
    type: ProfileTabType;
    source: SocialPlatform;
    profileId: string;
}) {
    switch (type) {
        case ProfileTabType.Feed:
            return <FeedList source={source} profileId={profileId} />;
        case ProfileTabType.Collected:
            return <CollectedList source={source} profileId={profileId} />;
        case ProfileTabType.Channels:
            return <ChannelList source={source} profileId={profileId} />;
        default:
            safeUnreachable(type);
            return null;
    }
});

interface TabsProps {
    profileId: string;
    source: SocialPlatform;
}

export function Tabs({ profileId, source }: TabsProps) {
    const [currentTab, setCurrentTab] = useState(ProfileTabType.Feed);

    const computedCurrentTab =
        (source === SocialPlatform.Lens && currentTab === ProfileTabType.Channels) ||
        (source === SocialPlatform.Farcaster && currentTab === ProfileTabType.Collected)
            ? ProfileTabType.Feed
            : currentTab;

    return (
        <>
            <div className=" flex gap-5 border-b border-lightLineSecond px-5 dark:border-line">
                {[
                    {
                        type: ProfileTabType.Feed,
                        title: <Trans>Feed</Trans>,
                    },
                    {
                        type: ProfileTabType.Collected,
                        title: <Trans>Collected</Trans>,
                    },
                    {
                        type: ProfileTabType.Channels,
                        title: <Trans>Channels</Trans>,
                    },
                ]
                    .filter((x) => {
                        if (!SORTED_PROFILE_TAB_TYPE.includes(x.type)) return false;

                        if (source === SocialPlatform.Lens) return x.type !== ProfileTabType.Channels;
                        if (source === SocialPlatform.Farcaster) return x.type !== ProfileTabType.Collected;
                        return true;
                    })
                    .map(({ type, title }) => (
                        <div key={type} className=" flex flex-col">
                            <ClickableButton
                                className={classNames(
                                    ' flex h-[46px] items-center px-[14px] font-extrabold transition-all',
                                    computedCurrentTab === type ? ' text-main' : ' text-third hover:text-main',
                                )}
                                onClick={() => setCurrentTab(type)}
                            >
                                {title}
                            </ClickableButton>
                            <span
                                className={classNames(
                                    ' h-1 w-full rounded-full bg-[#9250FF] transition-all',
                                    computedCurrentTab !== type ? ' hidden' : '',
                                )}
                            />
                        </div>
                    ))}
            </div>

            <Suspense fallback={<Loading />}>
                <ContentList type={computedCurrentTab} source={source} profileId={profileId} />
            </Suspense>
        </>
    );
}
