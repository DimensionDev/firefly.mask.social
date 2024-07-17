import { Trans } from '@lingui/macro';
import { useLocation } from '@tanstack/react-router';
import { memo, Suspense, useState } from 'react';
import { useMount } from 'react-use';

import { ClickableButton } from '@/components/ClickableButton.js';
import { DraftList } from '@/components/Compose/DraftList.js';
import { ScheduleTaskList } from '@/components/Compose/ScheduleTaskList.js';
import { Loading } from '@/components/Loading.js';
import { classNames } from '@/helpers/classNames.js';

export enum DraftPageTab {
    Draft = 'Draft',
    Scheduled = 'Scheduled',
}

export const DraftPage = memo(function DraftPage() {
    const [currentTab, setCurrentTab] = useState(DraftPageTab.Draft);

    const location = useLocation();

    useMount(() => {
        const search = location.search;
        if (search.tab) setCurrentTab(search.tab);
    });

    return (
        <div>
            <div className="scrollable-tab flex gap-3 border-b border-line px-4">
                {[
                    {
                        type: DraftPageTab.Draft,
                        title: <Trans>Unsent posts</Trans>,
                    },
                    {
                        type: DraftPageTab.Scheduled,
                        title: <Trans>Scheduled</Trans>,
                    },
                ].map(({ type, title }) => (
                    <div key={type} className="flex flex-1 flex-col">
                        <ClickableButton
                            className={classNames(
                                'flex h-[46px] items-center justify-center whitespace-nowrap px-[14px] font-extrabold transition-all',
                                currentTab === type ? 'text-main' : 'text-third hover:text-main',
                            )}
                            onClick={() => setCurrentTab(type)}
                        >
                            {title}
                        </ClickableButton>
                        <span
                            className={classNames(
                                'h-1 w-full rounded-full bg-fireflyBrand transition-all',
                                currentTab !== type ? 'hidden' : '',
                            )}
                        />
                    </div>
                ))}
            </div>
            {currentTab === DraftPageTab.Draft ? (
                <DraftList />
            ) : (
                <Suspense fallback={<Loading className="min-h-[478px] text-main" />}>
                    <ScheduleTaskList />
                </Suspense>
            )}
        </div>
    );
});
