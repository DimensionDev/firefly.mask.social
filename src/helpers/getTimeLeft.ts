import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration.js';

dayjs.extend(duration);

export function getTimeLeft(endDatetime: string, startDatetime = new Date().toISOString()) {
    const timeLeft = dayjs(endDatetime).diff(dayjs(startDatetime));
    if(timeLeft < 0) return

    const duration = dayjs.duration(timeLeft);

    return {
        days: duration.days(),
        hours: duration.hours(),
        minutes: duration.minutes(),
        seconds: duration.seconds()
    };
}
