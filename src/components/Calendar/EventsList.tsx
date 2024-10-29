import { Trans } from '@lingui/macro';
import { resolveIPFS_URL } from '@masknet/web3-shared-base';
import dayjs from 'dayjs';
import { useCallback, useMemo } from 'react';

import { EmptyStatus } from '@/components/Calendar/EmptyStatus.js';
import { ImageLoader } from '@/components/Calendar/ImageLoader.js';
import { LoadingStatus } from '@/components/Calendar/LoadingStatus.js';
import { Image } from '@/components/Image.js';
import { Link } from '@/esm/Link.js';
import type { MeetingEvent } from '@/types/calendar.js';

interface EventListProps {
    list: Record<string, MeetingEvent[]>;
    isLoading: boolean;
    empty: boolean;
    date: Date;
}

export function EventsList({ list, isLoading, empty, date }: EventListProps) {
    const futureEvents = useMemo(() => {
        return Object.keys(list).filter((key) => new Date(key) >= date);
    }, [list, date]);
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
                {isLoading && !list?.length ? (
                    <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 transform flex-col gap-3 whitespace-nowrap text-second">
                        <LoadingStatus />
                    </div>
                ) : !empty && futureEvents.length ? (
                    futureEvents.map((key) => {
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
                                                    src={resolveIPFS_URL(v.project.logo)!}
                                                    className="overflow-hidden rounded-full"
                                                    width={24}
                                                    height={24}
                                                    alt={v.project.name}
                                                />
                                                <p className="leading-16 text-xs font-bold">{v.project.name}</p>
                                            </div>
                                        </div>
                                        <p>{v.event_title}</p>
                                        <p className="text-second">
                                            {dayjs(new Date(v.event_date)).format('MMM DD, YYYY HH:mm')}
                                        </p>
                                        <ImageLoader src={v.poster_url} />
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
