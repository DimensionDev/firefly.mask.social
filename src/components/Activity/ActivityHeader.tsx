'use client';

import dayjs from 'dayjs';

import CalendarIcon from '@/assets/activity-calendar.svg';
import { ActivityStatusTag } from '@/components/Activity/ActivityStatus.js';
import { Image } from '@/components/Image.js';
import { classNames } from '@/helpers/classNames.js';
import type { ActivityInfoResponse } from '@/providers/types/Firefly.js';

export function ActivityHeader({
    data,
}: {
    data: Pick<
        Required<ActivityInfoResponse>['data'],
        'title' | 'sub_title' | 'start_time' | 'end_time' | 'status' | 'banner_url'
    >;
}) {
    const timeTemplate = 'MMM DD, HH:mm';
    return (
        <div className="flex w-full flex-col">
            <Image
                src={data.banner_url}
                alt={data.title}
                className={classNames('w-full object-cover')}
                width={343}
                height={140}
            />
            <div className="w-full px-6 py-4">
                <div className="w-full space-y-2 border-b border-line pb-4">
                    <div className="flex h-6 items-center space-x-1.5 text-[13px] leading-6">
                        <CalendarIcon className="h-4 w-4 shrink-0" />
                        <span>
                            {dayjs(data.start_time).utc().format(timeTemplate)} -{' '}
                            {dayjs(data.end_time).utc().format(timeTemplate)} (UTC)
                        </span>
                        <ActivityStatusTag status={data.status} />
                    </div>
                    <h1 className="text-xl font-semibold leading-6">{data.title}</h1>
                    <p className="line-clamp-2 text-sm leading-6">{data.sub_title}</p>
                </div>
            </div>
        </div>
    );
}
