import { Trans } from '@lingui/macro';
import { useState } from 'react';

import ContentCollected from '@/components/Profile/ContentCollected.js';
import ContentFeed from '@/components/Profile/ContentFeed.js';
import { classNames } from '@/helpers/classNames.js';

enum TabEnum {
    Feed = 'Feed',
    Collected = 'Collected',
}

interface ContentTabsProps {
    profileId: string;
}
export default function ContentTabs({ profileId }: ContentTabsProps) {
    const [tab, setTab] = useState<TabEnum>(TabEnum.Feed);

    return (
        <>
            <div className=" flex gap-5 border-b border-lightLineSecond px-5 dark:border-line">
                {Object.values(TabEnum).map((tabName) => (
                    <div key={tabName} className=" flex flex-col">
                        <button
                            className={classNames(
                                ' flex h-[46px] items-center px-[14px] font-extrabold transition-all',
                                tab === tabName ? ' text-lightMain' : ' text-secondary',
                            )}
                            onClick={() => setTab(tabName)}
                        >
                            {tabName === TabEnum.Feed ? <Trans>Feed</Trans> : <Trans>Collected</Trans>}
                        </button>
                        <span
                            className={classNames(
                                ' h-1 w-full rounded-full bg-tabLine transition-all',
                                tab !== tabName ? ' hidden' : '',
                            )}
                        />
                    </div>
                ))}
            </div>

            {tab === TabEnum.Feed && <ContentFeed profileId={profileId} />}

            {tab === TabEnum.Collected && <ContentCollected profileId={profileId} />}
        </>
    );
}
