'use client';

import { Tab } from '@headlessui/react';
import { t } from '@lingui/macro';
import { safeUnreachable } from '@masknet/kit';
import { useState } from 'react';

import { EventList } from '@/components/Calendar/EventList.js';
import { Footer } from '@/components/Calendar/Footer.js';
import { useEventList, useNewsList, useNFTList } from '@/components/Calendar/hooks/useEventList.js';
import { NewsList } from '@/components/Calendar/NewsList.js';
import { NFTList } from '@/components/Calendar/NFTList.js';
import { EMPTY_OBJECT } from '@/constants/index.js';

export function CalendarContent() {
    const tabs = [
        {
            label: t`Events`,
            value: 'events',
        },
        {
            label: t`News`,
            value: 'news',
        },
        {
            label: t`NFTs`,
            value: 'nfts',
        },
    ];

    const [currentTabIndex, setCurrentTabIndex] = useState(0);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [open, setOpen] = useState(false);

    const currentTab = tabs[currentTabIndex].value as (typeof tabs)[0]['value'] as 'news' | 'event' | 'nfts';

    const { data: eventList = EMPTY_OBJECT, isPending: eventLoading } = useEventList(
        selectedDate,
        currentTab === 'event',
    );
    const { data: newsList = EMPTY_OBJECT, isPending: newsLoading } = useNewsList(selectedDate, currentTab === 'news');
    const { data: nftList = EMPTY_OBJECT, isPending: nftLoading } = useNFTList(selectedDate, currentTab === 'nfts');

    const getListItems = () => {
        switch (currentTab) {
            case 'news':
                return newsList;
            case 'event':
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
                <Tab.List className="rounded-t-xl bg-opacity-80 px-4 py-2" style={{ backgroundColor: '#9250FF' }}>
                    {tabs.map((x) => (
                        <Tab className="font-bold" key={x.value}>
                            {x.label}
                        </Tab>
                    ))}
                </Tab.List>
                {/* <DatePickerTab
                    open={open}
                    setOpen={setOpen}
                    selectedDate={selectedDate}
                    setSelectedDate={setSelectedDate}
                    list={getListItems()}
                    currentTab={currentTab}
                /> */}
                <Tab.Panels className="rounded-b-xl border border-t-0 border-line">
                    <Tab.Panel className="px-3">
                        <NewsList
                            list={newsList}
                            isLoading={newsLoading}
                            empty={!Object.keys(newsList).length}
                            date={selectedDate}
                        />
                    </Tab.Panel>
                    <Tab.Panel className="px-3">
                        <EventList
                            list={eventList}
                            isLoading={eventLoading}
                            empty={!Object.keys(eventList).length}
                            date={selectedDate}
                        />
                    </Tab.Panel>
                    <Tab.Panel className="px-3">
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
