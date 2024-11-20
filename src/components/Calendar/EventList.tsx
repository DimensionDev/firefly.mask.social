import { Trans } from '@lingui/macro';
import { ElementAnchor, EmptyStatus } from '@masknet/shared';
import { EMPTY_LIST } from '@masknet/shared-base';
import { LoadingBase } from '@masknet/theme';
import { format } from 'date-fns';
import dayjs from 'dayjs';
import { uniq } from 'lodash-es';
import { useEffect, useMemo } from 'react';

import { useLumaEvents } from '@/components/Calendar/hooks/useLumaEvents.js';
import { ImageLoader } from '@/components/Calendar/ImageLoader.js';
import { Image } from '@/components/Image.js';
import { Loading } from '@/components/Loading.js';
import { Link } from '@/esm/Link.js';

interface EventListProps {
    date: Date;
    onDatesUpdate(/** locale date string list */ dates: string[]): void;
}

export const formatDate = (date: string) => {
    return format(new Date(date), 'MMM dd, yyyy HH:mm');
};

export function EventList({ date, onDatesUpdate }: EventListProps) {
    const { isLoading, isFetching, data, hasNextPage, fetchNextPage } = useLumaEvents();

    const comingEvents = useMemo(() => {
        if (!data) return EMPTY_LIST;
        return data.filter((x) => new Date(x.event_date) >= date);
    }, [data, date]);

    useEffect(() => {
        if (!data) return onDatesUpdate(EMPTY_LIST);
        onDatesUpdate(uniq(data.map((x) => new Date(x.event_date).toLocaleDateString())));
    }, [onDatesUpdate, data]);

    if (isLoading) {
        return (
            <div className="no-scrollbar relative flex h-[506px] w-full flex-col gap-[10px] overflow-y-scroll">
                <div className="pt-3">
                    <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 transform flex-col gap-3 whitespace-nowrap text-second">
                        <Loading />
                    </div>
                </div>
            </div>
        );
    }
    if (!comingEvents.length) {
        return (
            <div className="no-scrollbar relative flex h-[506px] w-full flex-col gap-[10px] overflow-y-scroll">
                <div className="pt-3">
                    <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 transform flex-col gap-3 whitespace-nowrap text-second">
                        <EmptyStatus>
                            <Trans>No events</Trans>
                        </EmptyStatus>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="no-scrollbar relative flex h-[506px] w-full flex-col gap-[10px] overflow-y-scroll">
            <div className="pt-3">
                {comingEvents.map((event) => {
                    return (
                        <div className="text-sm" key={event.event_id}>
                            <p className="p-2 font-bold leading-none">
                                {dayjs(new Date(event.event_date)).format('MMM DD, YYYY')}
                            </p>
                            <Link
                                className="flex cursor-pointer flex-col gap-2 border-b border-line p-2 text-main outline-none last:border-none hover:no-underline"
                                href={event.event_url}
                                rel="noopener noreferrer"
                                target="_blank"
                            >
                                <div className="flex w-full justify-between">
                                    <div className="flex items-center gap-2">
                                        <Image
                                            src={event.poster_url}
                                            className="overflow-hidden rounded-full"
                                            width={24}
                                            height={24}
                                            alt={event.event_title}
                                        />
                                        <p className="leading-16 text-xs font-bold">{event.event_title}</p>
                                    </div>
                                </div>
                                <p>{event.event_description || event.event_title}</p>
                                <p className="text-second">
                                    {dayjs(new Date(event.event_date)).format('MMM DD, YYYY HH:mm')}
                                </p>
                                <ImageLoader src={event.poster_url} />
                            </Link>
                        </div>
                    );
                })}
                {hasNextPage ? (
                    <ElementAnchor height={30} callback={() => fetchNextPage()}>
                        {isFetching ? <LoadingBase className="text-main" /> : null}
                    </ElementAnchor>
                ) : (
                    <p className="px-2 text-center text-second">
                        <Trans>No more data available.</Trans>
                    </p>
                )}
            </div>
        </div>
    );
}
