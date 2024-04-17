import { Trans } from '@lingui/macro';
import { Suspense, useState } from 'react';

import { ContentFeed } from '@/components/Channel/ContentFeed.js';
import { ClickableButton } from '@/components/ClickableButton.js';
import { Loading } from '@/components/Loading.js';
import { SocialPlatform } from '@/constants/enum.js';
import { classNames } from '@/helpers/classNames.js';

enum ContentType {
    Feed = 'Feed',
}

interface ContentTabsProps {
    channelId: string;
    source: SocialPlatform;
}
export function ContentTabs({ channelId, source }: ContentTabsProps) {
    const [currentTab, setCurrentTab] = useState(ContentType.Feed);

    // TODO: implement collected tab for farcaster
    const computedTab = source === SocialPlatform.Farcaster ? ContentType.Feed : currentTab;

    return (
        <>
            <div className=" flex gap-5 border-b border-lightLineSecond px-5 dark:border-line">
                {Object.values(ContentType).map((tab) => (
                    <div key={tab} className=" flex flex-col">
                        <ClickableButton
                            className={classNames(
                                ' flex h-[46px] items-center px-[14px] font-extrabold transition-all',
                                computedTab === tab ? ' text-main' : ' text-third hover:text-main',
                            )}
                            onClick={() => setCurrentTab(tab)}
                        >
                            {tab === ContentType.Feed ? <Trans>Feed</Trans> : <Trans>Collected</Trans>}
                        </ClickableButton>
                        <span
                            className={classNames(
                                ' h-1 w-full rounded-full bg-[#9250FF] transition-all',
                                computedTab !== tab ? ' hidden' : '',
                            )}
                        />
                    </div>
                ))}
            </div>

            {computedTab === ContentType.Feed && (
                <Suspense fallback={<Loading />}>
                    <ContentFeed source={source} channelId={channelId} />
                </Suspense>
            )}
        </>
    );
}
