'use client';

import { Tab } from '@headlessui/react';
import { t } from '@lingui/macro';
import { safeUnreachable } from '@masknet/kit';
import { useState } from 'react';

import { DatePickerTab } from '@/components/Calendar/DatePickerTab.js';
import { useNewsList, useNFTList } from '@/components/Calendar/hooks/useEventList.js';
import { NewsList } from '@/components/Calendar/NewsList.js';
import { NFTList } from '@/components/Calendar/NFTList.js';
import { EMPTY_OBJECT } from '@/constants/index.js';
import { classNames } from '@/helpers/classNames.js';

export function CalendarContent() {
    const tabs = [
        {
            label: t`News`,
            value: 'news',
        },
        {
            label: t`NFTs`,
            value: 'nfts',
        },
    ] as const;

    const [currentTabIndex, setCurrentTabIndex] = useState(0);
    const [selectedDate, setSelectedDate] = useState(() => new Date());
    const [open, setOpen] = useState(false);

    const currentTab = tabs[currentTabIndex].value;

    const { data: newsList = EMPTY_OBJECT, isPending: newsLoading } = useNewsList(selectedDate, currentTab === 'news');
    const { data: nftList = EMPTY_OBJECT, isPending: nftLoading } = useNFTList(selectedDate, currentTab === 'nfts');

    const getListItems = () => {
        switch (currentTab) {
            case 'news':
                return newsList;
            case 'nfts':
                return nftList;
            default:
                safeUnreachable(currentTab);
                return null;
        }
    };

    return (
        <div className="relative flex flex-col rounded-xl">
            <Tab.Group selectedIndex={currentTabIndex} onChange={setCurrentTabIndex}>
                <Tab.List className="calendar-tab-list flex rounded-t-xl bg-[#9250FF80] bg-none px-4 pt-2">
                    {tabs.map((x, i) => (
                        <Tab
                            className={classNames(
                                'flex-1 rounded-t-xl px-4 py-[11px] font-bold leading-none outline-none',
                                {
                                    'text-white dark:text-lightSecond': currentTabIndex !== i,
                                    'text-main dark:text-white': currentTabIndex === i,
                                    'bg-white dark:bg-black': currentTabIndex === i,
                                },
                            )}
                            key={x.value}
                        >
                            {x.label}
                        </Tab>
                    ))}
                </Tab.List>
                <DatePickerTab
                    open={open}
                    setOpen={setOpen}
                    selectedDate={selectedDate}
                    setSelectedDate={setSelectedDate}
                    list={getListItems()}
                    currentTab={currentTab}
                />
                <Tab.Panels className="rounded-b-xl border border-t-0 border-line px-2">
                    <Tab.Panel>
                        <NewsList list={newsList} isLoading={newsLoading} date={selectedDate} />
                    </Tab.Panel>
                    <Tab.Panel>
                        <NFTList list={nftList} isLoading={nftLoading} date={selectedDate} />
                    </Tab.Panel>
                </Tab.Panels>
            </Tab.Group>
        </div>
    );
}
