import { Trans } from '@lingui/macro';
import { format } from 'date-fns';

import CalendarIcon from '@/assets/calendar.svg';
import LocationIcon from '@/assets/location.svg';
import { EmptyStatus } from '@/components/Calendar/EmptyStatus.js';
import { useLumaEvents } from '@/components/Calendar/hooks/useLumaEvents.js';
import { ImageLoader } from '@/components/Calendar/ImageLoader.js';
import { ElementAnchor } from '@/components/ElementAnchor.js';
import { Image } from '@/components/Image.js';
import { Loading } from '@/components/Loading.js';
import { EMPTY_LIST } from '@/constants/index.js';
import { Link } from '@/esm/Link.js';

interface EventListProps {
    date: Date;
}

export function EventList({ date }: EventListProps) {
    const { isLoading, isFetching, data = EMPTY_LIST, hasNextPage, fetchNextPage } = useLumaEvents(date);

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

    if (!data.length) {
        return (
            <div className="no-scrollbar relative flex h-[506px] w-full flex-col gap-[10px] overflow-y-scroll">
                <div className="pt-3">
                    <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 transform flex-col gap-3 whitespace-nowrap text-second">
                        <EmptyStatus>
                            <Trans>No content for the last two weeks.</Trans>
                        </EmptyStatus>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="no-scrollbar relative flex h-[506px] w-full flex-col gap-[10px] overflow-y-scroll overscroll-contain">
            <div className="pt-3">
                {data.map((event) => {
                    return (
                        <Link
                            key={event.event_id}
                            className="flex cursor-pointer flex-col gap-2 border-b border-line p-2 text-main outline-none last:border-none hover:no-underline"
                            href={event.event_url}
                            rel="noopener noreferrer"
                            target="_blank"
                        >
                            {event.host_name && event.host_avatar ? (
                                <div className="flex w-full justify-between">
                                    <div className="flex items-center gap-2">
                                        <Image
                                            src={event.host_avatar}
                                            className="overflow-hidden rounded-full"
                                            width={24}
                                            height={24}
                                            alt={event.host_name}
                                        />
                                        <p className="leading-16 text-xs font-bold">{event.host_name}</p>
                                    </div>
                                </div>
                            ) : null}
                            <p className="text-sm">{event.event_description || event.event_title}</p>
                            <p className="flex items-center gap-3 text-[13px] leading-[18px] text-main">
                                <LocationIcon width={18} height={18} className="shrink-0" />
                                {event.event_full_location}
                            </p>
                            <p className="flex items-center gap-3 text-[13px] leading-[18px] text-main">
                                <CalendarIcon className="shrink-0" width={18} height={18} />
                                {format(event.event_date, 'MMM dd, yyyy HH:mm')}
                            </p>
                            <ImageLoader src={event.poster_url} />
                        </Link>
                    );
                })}
                {hasNextPage ? (
                    <ElementAnchor className="h-8" callback={() => fetchNextPage()}>
                        {isFetching ? <Loading className="text-main" /> : null}
                    </ElementAnchor>
                ) : (
                    <p className="py-2 text-center text-xs text-second">
                        <Trans>No more data available.</Trans>
                    </p>
                )}
            </div>
        </div>
    );
}
