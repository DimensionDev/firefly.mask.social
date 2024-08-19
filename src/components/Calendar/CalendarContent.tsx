import { Trans } from '@lingui/macro';
import { safeUnreachable } from '@masknet/kit';
import { makeStyles, MaskTabList, useTabs } from '@masknet/theme';
import { TabContext, TabPanel } from '@mui/lab';
import { Tab } from '@mui/material';
import { useMemo, useState } from 'react';

import { DatePickerTab } from '@/components/Calendar/components/DatePickerTab.jsx';
import { EventList } from '@/components/Calendar/components/EventList.jsx';
import { Footer } from '@/components/Calendar/components/Footer.jsx';
import { NewsList } from '@/components/Calendar/components/NewsList.jsx';
import { NFTList } from '@/components/Calendar/components/NFTList.jsx';
import { useEventList, useNewsList, useNFTList } from '@/components/hooks/useEventList.js';
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
    const { classes } = useStyles();
    const [currentTab, onChange, tabs] = useTabs('news', 'event', 'nfts');
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [open, setOpen] = useState(false);
    const { data: eventList = EMPTY_OBJECT, isPending: eventLoading } = useEventList(
        selectedDate,
        currentTab === 'event',
    );
    const { data: newsList = EMPTY_OBJECT, isPending: newsLoading } = useNewsList(selectedDate, currentTab === 'news');
    const { data: nftList = EMPTY_OBJECT, isPending: nftLoading } = useNFTList(selectedDate, currentTab === 'nfts');
    const list = useMemo(() => {
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
    }, [currentTab, newsList, eventList, nftList]);

    return (
        <div className={classes.calendar}>
            <TabContext value={currentTab}>
                <div className={classes.tabList}>
                    <MaskTabList variant="base" onChange={onChange} aria-label="">
                        <Tab className={classes.tab} label={<Trans>News</Trans>} value={tabs.news} />
                        <Tab className={classes.tab} label={<Trans>Events</Trans>} value={tabs.event} />
                        <Tab className={classes.tab} label={<Trans>NFTs</Trans>} value={tabs.nfts} />
                    </MaskTabList>
                </div>
                <DatePickerTab
                    open={open}
                    setOpen={setOpen}
                    selectedDate={selectedDate}
                    setSelectedDate={setSelectedDate}
                    list={list}
                    currentTab={currentTab}
                />
                <TabPanel value={tabs.news} className={classes.tabPanel}>
                    <NewsList
                        list={newsList}
                        isLoading={newsLoading}
                        empty={!Object.keys(newsList).length}
                        date={selectedDate}
                    />
                </TabPanel>
                <TabPanel value={tabs.event} className={classes.tabPanel}>
                    <EventList
                        list={eventList}
                        isLoading={eventLoading}
                        empty={!Object.keys(eventList).length}
                        date={selectedDate}
                    />
                </TabPanel>
                <TabPanel value={tabs.nfts} className={classes.tabPanel}>
                    <NFTList
                        list={nftList}
                        isLoading={nftLoading}
                        empty={!Object.keys(newsList).length}
                        date={selectedDate}
                    />
                </TabPanel>
                <Footer />
            </TabContext>
        </div>
    );
}
