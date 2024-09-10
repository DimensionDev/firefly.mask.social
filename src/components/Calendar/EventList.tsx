import { Trans } from '@lingui/macro';
import { resolveIPFS_URL } from '@masknet/web3-shared-base';
import { Link, Typography } from '@mui/material';
import dayjs from 'dayjs';
import { useCallback, useMemo } from 'react';

import { EmptyStatus } from '@/components/Calendar/EmptyStatus.js';
import { ImageLoader } from '@/components/Calendar/ImageLoader.js';
import { LoadingStatus } from '@/components/Calendar/LoadingStatus.js';
import { Image } from '@/components/Image.js';
import { classNames } from '@/helpers/classNames.js';

interface EventListProps {
    list: Record<string, any[]>;
    isLoading: boolean;
    empty: boolean;
    date: Date;
}

export function EventList({ list, isLoading, empty, date }: EventListProps) {
    const futureEvents = useMemo(() => {
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
                    <div
                        className={classNames(
                            'absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 transform flex-col gap-3 whitespace-nowrap text-second',
                            'leading-18',
                        )}
                    >
                        <LoadingStatus />
                    </div>
                ) : !empty && futureEvents.length ? (
                    futureEvents.map((key) => {
                        return (
                            <div key={key}>
                                <Typography className={'leading-18 py-[10px] font-bold text-main'}>
                                    {dayjs(new Date(key)).format('MMM dd,yyy')}
                                </Typography>
                                {list[key].map((v) => (
                                    <Link
                                        key={v.event_url}
                                        className={'flex cursor-pointer flex-col gap-2 p-2 hover:no-underline'}
                                        href={v.event_url}
                                        rel="noopener noreferrer"
                                        target="_blank"
                                    >
                                        <div className={'flex w-full justify-between'}>
                                            <div className={'flex items-center gap-2 text-main'}>
                                                <Image
                                                    src={resolveIPFS_URL(v.project.logo)!}
                                                    className={'overflow-hidden rounded-full'}
                                                    width={24}
                                                    height={24}
                                                    alt={v.project.name}
                                                />
                                                <Typography className={'leading-16 text-sm font-bold text-main'}>
                                                    {v.project.name}
                                                </Typography>
                                            </div>
                                        </div>
                                        <Typography className={'leading-18'}>{v.event_title}</Typography>
                                        <Typography className={'leading-18 text-second'}>
                                            {dayjs(new Date(v.event_date)).format('MMM dd, yyyy HH:mm')}
                                        </Typography>
                                        <ImageLoader src={v.poster_url} />
                                    </Link>
                                ))}
                            </div>
                        );
                    })
                ) : (
                    <EmptyStatus
                        className={
                            'absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 transform flex-col gap-3 whitespace-nowrap text-second'
                        }
                    >
                        <Trans>No content for the last two weeks.</Trans>
                    </EmptyStatus>
                )}
            </div>
        </div>
    );
}
