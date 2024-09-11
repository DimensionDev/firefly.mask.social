'use client';

import { Tab } from '@headlessui/react';
import { t } from '@lingui/macro';
import { safeUnreachable } from '@masknet/kit';
import { useState } from 'react';

import { DatePickerTab } from '@/components/Calendar/DatePickerTab.js';
import { EventsList } from '@/components/Calendar/EventsList.js';
import { Footer } from '@/components/Calendar/Footer.js';
import { useEventList, useNewsList, useNFTList } from '@/components/Calendar/hooks/useEventList.js';
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
            label: t`Events`,
            value: 'events',
        },
        {
            label: t`NFTs`,
            value: 'nfts',
        },
    ];

    const [currentTabIndex, setCurrentTabIndex] = useState(0);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [open, setOpen] = useState(false);

    const currentTab = tabs[currentTabIndex].value as (typeof tabs)[0]['value'] as 'news' | 'events' | 'nfts';

    const { data: newsList = EMPTY_OBJECT, isPending: newsLoading } = useNewsList(selectedDate, currentTab === 'news');
    const { data: eventList = EMPTY_OBJECT, isPending: eventLoading } = useEventList(
        selectedDate,
        currentTab === 'events',
    );
    const { data: nftList = EMPTY_OBJECT, isPending: nftLoading } = useNFTList(selectedDate, currentTab === 'nfts');

    const getListItems = () => {
        switch (currentTab) {
            case 'news':
                return newsList;
            case 'events':
                return eventList;
            case 'nfts':
                return nftList;
            default:
                safeUnreachable(currentTab);
                return null;
        }
    };

    return (
        <div className="relative mb-5 flex flex-col rounded-xl">
            <Tab.Group selectedIndex={currentTabIndex} onChange={setCurrentTabIndex}>
                <Tab.List className="calendar-tab-list flex rounded-t-xl bg-[#9250FF80] bg-white bg-opacity-80 bg-none px-4 pt-2">
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
                        <NewsList
                            list={newsList}
                            isLoading={newsLoading}
                            empty={!Object.keys(newsList).length}
                            date={selectedDate}
                        />
                    </Tab.Panel>
                    <Tab.Panel>
                        <EventsList
                            list={eventList}
                            isLoading={eventLoading}
                            empty={!Object.keys(eventList).length}
                            date={selectedDate}
                        />
                    </Tab.Panel>
                    <Tab.Panel>
                        <NFTList
                            list={nftList}
                            isLoading={nftLoading}
                            empty={!Object.keys(newsList).length}
                            date={selectedDate}
                        />
                    </Tab.Panel>
                </Tab.Panels>

                <Footer />
            </Tab.Group>
        </div>
    );
}
