'use client';

import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react';
import { Trans } from '@lingui/macro';
import { useState } from 'react';

import { DatePickerTab } from '@/components/Calendar/DatePickerTab.js';
import { EventList } from '@/components/Calendar/EventList.js';
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
    const [open, setOpen] = useState(false);

    const [allowedDates, setAllowedDates] = useState<string[]>(EMPTY_LIST);

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
                    onChange={setDate}
                    allowedDates={allowedDates}
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
