import { Trans } from '@lingui/macro';
import dayjs from 'dayjs';
import { useCallback, useMemo } from 'react';

import { EmptyStatus } from '@/components/Calendar/EmptyStatus.js';
import { LoadingStatus } from '@/components/Calendar/LoadingStatus.js';
import { Image } from '@/components/Image.js';
import { Link } from '@/esm/Link.js';
import type { NewsEvent } from '@/types/calendar.js';

interface NewsListProps {
    list: Record<string, NewsEvent[]>;
    isLoading: boolean;
    date: Date;
}

export function NewsList({ list, isLoading, date }: NewsListProps) {
    const futureNewsList = useMemo(() => {
        return Object.keys(list).filter((key) => new Date(key) >= date);
    }, [list, date]);
    const empty = !futureNewsList.length;
    const listRef = useCallback((el: HTMLDivElement | null) => {
        el?.scrollTo({ top: 0 });
    }, []);

    return (
        <div
            className="no-scrollbar relative flex h-[506px] w-full flex-col gap-[10px] overflow-y-scroll"
            ref={listRef}
            key={date.toISOString()}
        >
            <div>
                {isLoading && empty ? (
                    <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 transform flex-col gap-3 whitespace-nowrap text-second">
                        <LoadingStatus />
                    </div>
                ) : !empty && futureNewsList.length ? (
                    futureNewsList.map((key) => {
                        return (
                            <div className="text-sm" key={key}>
                                <p className="p-2 font-bold leading-none">
                                    {dayjs(new Date(key)).format('MMM DD, YYYY')}
                                </p>
                                {list[key].map((v) => (
                                    <Link
                                        className="flex cursor-pointer flex-col gap-2 border-b border-line p-2 outline-none last:border-none hover:no-underline"
                                        key={v.event_url}
                                        href={v.event_url}
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
                                                <p className="text-xs font-bold text-main">{v.project.name}</p>
                                            </div>
                                            <p className="flex items-center justify-center rounded-md bg-bg px-2 py-1 text-center text-xs text-main">
                                                {v.event_type}
                                            </p>
                                        </div>
                                        <p className="text-main">{v.event_title}</p>
                                        <p className="text-xs text-second">{v.event_description}</p>
                                    </Link>
                                ))}
                            </div>
                        );
                    })
                ) : (
                    <EmptyStatus>
                        <Trans>No content for the last two weeks.</Trans>
                    </EmptyStatus>
                )}
            </div>
        </div>
    );
}
