import { Tab } from '@headlessui/react';
import { t } from '@lingui/macro';
import { safeUnreachable } from '@masknet/kit';
import { makeStyles } from '@masknet/theme';
import { useState } from 'react';

import { DatePickerTab } from '@/components/Calendar/DatePickerTab.js';
import { EventList } from '@/components/Calendar/EventList.js';
import { Footer } from '@/components/Calendar/Footer.js';
import { useEventList, useNewsList, useNFTList } from '@/components/Calendar/hooks/useEventList.js';
import { NewsList } from '@/components/Calendar/NewsList.js';
import { NFTList } from '@/components/Calendar/NFTList.js';
import { EMPTY_OBJECT } from '@/constants/index.js';

const useStyles = makeStyles()((theme) => ({
    calendar: {
        display: 'flex',
        flexDirection: 'column',
        borderRadius: '12px',
        border: `1px solid ${theme.palette.maskColor.line}`,
        position: 'relative',
        marginBottom: '20px',
    },
    tab: {
        fontSize: 16,
        fontWeight: 700,
    },
    tabList: {
        background:
            'linear-gradient(180deg, rgba(255, 255, 255, 0.00) 0%, rgba(255, 255, 255, 0.80) 100%), linear-gradient(90deg, rgba(28, 104, 243, 0.20) 0%, rgba(69, 163, 251, 0.20) 100%), #FFF',
        padding: '8px 16px 0 16px',
        borderRadius: '12px 12px 0 0',
    },
    tabPanel: {
        padding: '0 4px 0 12px',
    },
}));

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

    const { classes } = useStyles();
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
        <div className={classes.calendar}>
            <Tab.Group selectedIndex={currentTabIndex} onChange={setCurrentTabIndex}>
                <Tab.List className={classes.tabList}>
                    {tabs.map((x) => (
                        <Tab className={classes.tab} key={x.value}>
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
                <Tab.Panels>
                    <Tab.Panel className={classes.tabPanel}>
                        <NewsList
                            list={newsList}
                            isLoading={newsLoading}
                            empty={!Object.keys(newsList).length}
                            date={selectedDate}
                        />
                    </Tab.Panel>
                    <Tab.Panel className={classes.tabPanel}>
                        <EventList
                            list={eventList}
                            isLoading={eventLoading}
                            empty={!Object.keys(eventList).length}
                            date={selectedDate}
                        />
                    </Tab.Panel>
                    <Tab.Panel className={classes.tabPanel}>
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
