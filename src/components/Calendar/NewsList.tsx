import { Trans } from '@lingui/macro';
import { Link, Typography } from '@mui/material';
import dayjs from 'dayjs';
import { useCallback, useMemo } from 'react';

import { EmptyStatus } from '@/components/Calendar/EmptyStatus.js';
import { LoadingStatus } from '@/components/Calendar/LoadingStatus.js';
import { Image } from '@/components/Image.js';

interface NewsListProps {
    list: Record<string, any[]>;
    isLoading: boolean;
    empty: boolean;
    date: Date;
}

export function NewsList({ list, isLoading, empty, date }: NewsListProps) {
    const futureNewsList = useMemo(() => {
        return Object.keys(list).filter((key) => new Date(key) >= date);
    }, [list, date]);
    const listRef = useCallback((el: HTMLDivElement | null) => {
        el?.scrollTo({ top: 0 });
    }, []);

    return (
        <div
            className="scrollbar-none relative mb-[50px] flex h-[506px] w-full flex-col gap-[10px] overflow-y-scroll"
            ref={listRef}
            key={date.toISOString()}
        >
            <div className="pr-3">
                {isLoading && !list?.length ? (
                    <div className="leading-18 absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 transform flex-col gap-3 whitespace-nowrap text-main">
                        <LoadingStatus />
                    </div>
                ) : !empty && futureNewsList.length ? (
                    futureNewsList.map((key) => {
                        return (
                            <div key={key}>
                                <p className="leading-18 py-[10px] font-bold text-main">
                                    {dayjs(new Date(key)).format('MMM dd,yyy')}
                                </p>
                                {list[key].map((v) => (
                                    <Link
                                        key={v.event_url}
                                        href={v.event_url}
                                        className="leading-16 flex cursor-pointer flex-col gap-2 border-b border-line pb-2 text-sm font-bold hover:no-underline"
                                        rel="noopener noreferrer"
                                        target="_blank"
                                    >
                                        <div className="flex w-full justify-between">
                                            <div className="flex items-center gap-2">
                                                <Image
                                                    className="overflow-hidden rounded-full"
                                                    src={v.project.logo}
                                                    width={24}
                                                    height={24}
                                                    alt={v.project.name}
                                                />
                                                <p className="leading-16 text-sm font-bold text-main">
                                                    {v.project.name}
                                                </p>
                                            </div>
                                            <p className="flex items-center justify-center rounded-md bg-bg px-2 py-1 text-center text-sm text-main">
                                                {v.event_type}
                                            </p>
                                        </div>
                                        <p className="leading-18 text-main">{v.event_title}</p>
                                        <p className="leading-18 text-second">{v.event_description}</p>
                                    </Link>
                                ))}
                            </div>
                        );
                    })
                ) : (
                    <EmptyStatus className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 transform flex-col gap-3 whitespace-nowrap text-second">
                        <Trans>No content for the last two weeks.</Trans>
                    </EmptyStatus>
                )}
            </div>
        </div>
    );
}
