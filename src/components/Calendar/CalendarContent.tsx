'use client';

import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react';
import { Trans } from '@lingui/macro';
import { uniq } from 'lodash-es';
import { useMemo, useState } from 'react';

import { DatePickerTab } from '@/components/Calendar/DatePickerTab.js';
import { EventList } from '@/components/Calendar/EventList.js';
import { useNewsList } from '@/components/Calendar/hooks/useEventList.js';
import { useLumaEvents } from '@/components/Calendar/hooks/useLumaEvents.js';
import { NewsList } from '@/components/Calendar/NewsList.js';
import { EMPTY_LIST } from '@/constants/index.js';
import { classNames } from '@/helpers/classNames.js';

export function CalendarContent() {
    const tabs = [
        {
            label: <Trans>News</Trans>,
            value: 'news',
        },
        {
            label: <Trans>Events</Trans>,
            value: 'events',
        },
    ] as const;

    const [currentTabIndex, setCurrentTabIndex] = useState(0);
    const [date, setDate] = useState(() => new Date(Math.floor(Date.now() / 1000) * 1000)); // round to seconds
    const [pickerDate, setPickerDate] = useState(date);
    const [open, setOpen] = useState(false);

    const { data: newsList = EMPTY_LIST } = useNewsList(pickerDate, currentTabIndex === 0);
    const { data: eventList = EMPTY_LIST } = useLumaEvents(pickerDate, currentTabIndex === 1);

    const [allowedDates, setAllowedDates] = useState<string[]>(EMPTY_LIST);
    const allAllowedDates = useMemo(() => {
        const list = currentTabIndex === 0 ? newsList : eventList;
        const dates = list.map((x) => new Date(x.event_date).toLocaleDateString());
        return uniq([...dates, ...allowedDates]);
    }, [allowedDates, newsList, eventList, currentTabIndex]);

    return (
        <div className="relative flex flex-col rounded-xl">
            <TabGroup selectedIndex={currentTabIndex} onChange={setCurrentTabIndex}>
                <TabList className="calendar-tab-list flex rounded-t-xl bg-[#9250FF80] bg-none px-4 pt-2">
                    {tabs.map((x, i) => (
                        <Tab
                            className={classNames(
                                'flex-1 rounded-t-xl px-4 py-[11px] font-bold leading-none outline-none',
                                {
                                    tabItem: currentTabIndex !== i,
                                    activeTabItem: currentTabIndex === i,
                                },
                            )}
                            key={x.value}
                        >
                            {x.label}
                        </Tab>
                    ))}
                </TabList>
                <DatePickerTab
                    open={open}
                    onToggle={setOpen}
                    date={date}
                    allowedDates={allAllowedDates}
                    onChange={setDate}
                    onMonthChange={setPickerDate}
                />
                <TabPanels className="rounded-b-xl border border-t-0 border-line px-2">
                    <TabPanel>
                        <NewsList date={date} onDatesUpdate={setAllowedDates} />
                    </TabPanel>
                    <TabPanel>
                        <EventList date={date} onDatesUpdate={setAllowedDates} />
                    </TabPanel>
                </TabPanels>
            </TabGroup>
        </div>
    );
}
