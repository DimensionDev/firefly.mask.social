import dayjs from 'dayjs';

import { formatDate } from '@/helpers/formatTimestamp.js';
import { isTimestamp, isUnixTimestamp } from '@/helpers/ts.js';

export function getNFTPropertyDateString(dateString: string) {
    if (isUnixTimestamp(dateString)) {
        return formatDate(dayjs.unix(parseInt(dateString, 10)).toDate());
    } else if (isTimestamp(dateString)) {
        return formatDate(dayjs(parseInt(dateString, 10)).toDate());
    }
    return formatDate(dayjs(dateString).toDate());
}
