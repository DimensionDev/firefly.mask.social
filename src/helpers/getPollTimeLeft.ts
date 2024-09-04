import { plural, t } from '@lingui/macro';

import { getTimeLeft } from '@/helpers/getTimeLeft.js';

export function getPollTimeLeft(endDatetime: string) {
    const { days, hours, minutes, seconds } = getTimeLeft(endDatetime);

    if (days >= 1) return plural(days, { one: '1 day left', other: `${days} days left` });
    if (hours >= 1) return plural(hours, { one: '1 hour left', other: `${hours} hours left` });
    if (minutes >= 1) return plural(minutes, { one: '1 minute left', other: `${minutes} minutes left` });
    if (seconds >= 1) return plural(seconds, { one: '1 second left', other: `${seconds} seconds left` });
    return t`Final results`;
}
