'use client';

import dayjs from 'dayjs';

import CalendarIcon from '@/assets/activity-calendar.svg';
import { ActivityStatusTag } from '@/components/Activity/ActivityStatus.js';
import { Image } from '@/components/Image.js';
import { Link } from '@/esm/Link.js';
import { classNames } from '@/helpers/classNames.js';
import { type ActivityListItem as TypeActivityListItem, ActivityStatus } from '@/providers/types/Firefly.js';

export function getActivityListItem(index: number, data: TypeActivityListItem) {
    return <ActivityListItem data={data} index={index} />;
}

export function ActivityListItem({ data }: { data: TypeActivityListItem; index?: number }) {
    const timeTemplate = 'MMM DD, HH:mm';
    return (
        <Link
            href={`/event/${data.name}`}
            className="relative mb-4 flex w-full flex-col rounded-2xl border border-line bg-bg"
        >
            <div className="absolute right-2 top-2 z-[1]">
                <ActivityStatusTag status={data.status} />
            </div>
            <Image
                src={data.banner_url}
                alt={data.title}
                className={classNames('aspect-[343/140] w-full rounded-t-2xl object-cover', {
                    'opacity-80': data.status === ActivityStatus.Ended,
                })}
                width={343}
                height={140}
            />
            <div className="w-full space-y-1 rounded-b-2xl p-2 text-lightMain">
                <h4 className="truncate text-base font-semibold leading-6">{data.title}</h4>
                {data.description ? <p className="line-clamp-2 text-sm leading-6">{data.description}</p> : null}
                <div className="flex h-6 items-center space-x-1.5 text-[13px] leading-6">
                    <CalendarIcon className="h-4 w-4 shrink-0" />
                    <span>
                        {dayjs(data.start_time).utc().format(timeTemplate)} -{' '}
                        {dayjs(data.end_time).utc().format(timeTemplate)} (UTC)
                    </span>
                </div>
            </div>
        </Link>
    );
}
