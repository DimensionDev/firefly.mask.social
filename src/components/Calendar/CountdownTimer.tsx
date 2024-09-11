import { Trans } from '@lingui/macro';
import { differenceInSeconds } from 'date-fns';
import { useEffect, useState } from 'react';

interface CountdownTimerProps {
    targetDate: Date;
}

const calculateRemainingTime = (targetDate: Date) => {
    const currentDate = new Date();
    const difference = differenceInSeconds(targetDate, currentDate);
    return difference > 0 ? difference : 0;
};

export function CountdownTimer({ targetDate }: CountdownTimerProps) {
    const [remainingTime, setRemainingTime] = useState(() => calculateRemainingTime(targetDate));

    useEffect(() => {
        const interval = setInterval(() => {
            const newRemainingTime = calculateRemainingTime(targetDate);
            setRemainingTime(newRemainingTime);

            if (newRemainingTime === 0) {
                clearInterval(interval);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [targetDate]);

    const days = Math.floor(remainingTime / (60 * 60 * 24));
    const hours = Math.floor((remainingTime % (60 * 60 * 24)) / (60 * 60));
    const minutes = Math.floor((remainingTime % (60 * 60)) / 60);
    const seconds = remainingTime % 60;

    return (
        <p className="flex items-center justify-center rounded-md bg-bg px-4 py-[2px] text-xs leading-none">
            {remainingTime === 0 ? <Trans>Expired</Trans> : `${days}d :${hours}h :${minutes}m :${seconds}s`}
        </p>
    );
}
