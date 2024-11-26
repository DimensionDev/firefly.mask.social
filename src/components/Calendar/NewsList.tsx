import { Trans } from '@lingui/macro';
import { uniq } from 'lodash-es';
import { useEffect, useMemo } from 'react';

import { EmptyStatus } from '@/components/Calendar/EmptyStatus.js';
import { useNewsList } from '@/components/Calendar/hooks/useEventList.js';
import { ElementAnchor } from '@/components/ElementAnchor.js';
import { Image } from '@/components/Image.js';
import { Loading } from '@/components/Loading.js';
import { EMPTY_LIST } from '@/constants/index.js';
import { Link } from '@/esm/Link.js';
import type { ParsedEvent } from '@/types/calendar.js';

interface NewsListProps {
    date: Date;
    onDatesUpdate(/** locale date string list */ dates: string[]): void;
}

interface Group {
    date: number;
    /** 2024/10/10 */
    label: string;
    events: ParsedEvent[];
}

export function NewsList({ date, onDatesUpdate }: NewsListProps) {
    const { data: newsList, isPending, hasNextPage, isFetching, fetchNextPage } = useNewsList(date, true);

    const groups = useMemo(() => {
        if (!newsList?.length) return EMPTY_LIST;
        const groups: Group[] = [];
        newsList.forEach((event) => {
            const eventDate = new Date(event.event_date);
            if (eventDate < date) return;
            const label = eventDate.toLocaleDateString();
            const group: Group = groups.find((g) => g.label === label) || {
                date: event.event_date,
                label,
                events: [],
            };
            if (!group.events.length) groups.push(group);
            group.events.push(event);
        });
        return groups;
    }, [newsList, date]);

    useEffect(() => {
        if (!newsList) return onDatesUpdate(EMPTY_LIST);
        onDatesUpdate(uniq(newsList.map((x) => new Date(x.event_date).toLocaleDateString())));
    }, [onDatesUpdate, newsList]);

    if (isPending && !groups.length) {
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
    if (!groups.length) {
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
        <div className="no-scrollbar relative flex h-[506px] w-full flex-col gap-[10px] overflow-y-scroll">
            {groups.map((group) => {
                return (
                    <div className="text-sm" key={group.label}>
                        <p className="p-2 font-bold leading-none">{group.label}</p>
                        {group.events.map((event) => (
                            <Link
                                className="flex cursor-pointer flex-col gap-2 border-b border-line p-2 outline-none last:border-none hover:no-underline"
                                key={event.event_url}
                                href={event.event_url}
                                rel="noopener noreferrer"
                                target="_blank"
                            >
                                <div className="flex w-full justify-between">
                                    {event.project ? (
                                        <div className="flex items-center gap-2">
                                            <Image
                                                className="overflow-hidden rounded-full"
                                                src={event.project.logo}
                                                width={24}
                                                height={24}
                                                alt={event.project.name}
                                            />
                                            <p className="text-xs font-bold text-main">{event.project.name}</p>
                                        </div>
                                    ) : null}
                                    <p className="flex items-center justify-center rounded-md bg-bg px-2 py-1 text-center text-xs text-main">
                                        {event.event_type}
                                    </p>
                                </div>
                                <p className="text-main">{event.event_title}</p>
                                <p className="text-xs text-second">{event.event_description}</p>
                            </Link>
                        ))}
                    </div>
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
    );
}
