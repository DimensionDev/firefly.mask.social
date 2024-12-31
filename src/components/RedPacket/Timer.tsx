'use client';

import { Trans } from '@lingui/macro';
import dayjs from 'dayjs';
import { useState } from 'react';
import { useInterval } from 'usehooks-ts';

import HourGlassIcon from '@/assets/hourglass.svg';
import { getTimeLeft } from '@/helpers/formatTimestamp.js';

export function Timer({ endTime }: { endTime: number }) {
    const [now, setNow] = useState(Date.now());

    const timeLeft = getTimeLeft(endTime, now);
    const isExpired = dayjs(now).isAfter(endTime);

    useInterval(
        () => {
            setNow(Date.now());
        },
        !isExpired ? 1000 : null,
    );
    if (isExpired || !timeLeft) return null;
    return (
        <div className="flex items-center justify-center gap-[6px] text-nowrap rounded-full bg-[#E8E8FF] px-[13px] py-[7px] opacity-75 backdrop-blur-[5px]">
            <HourGlassIcon width={12} height={12} />
            <span className="flex-1 text-xs leading-4">
                <Trans>
                    {timeLeft.hours}h: {timeLeft.minutes}m: {timeLeft.seconds}s
                </Trans>
            </span>
        </div>
    );
}
