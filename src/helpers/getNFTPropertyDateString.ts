import dayjs from 'dayjs';

import { formatDate } from '@/helpers/formatTimestamp.js';
import { isTimestamp } from '@/helpers/isTimestamp.js';
import { isUnixTimestamp } from '@/helpers/isUnixTimestamp.js';

export function getNFTPropertyDateString(dateString: string) {
    if (isUnixTimestamp(dateString)) {
        return formatDate(dayjs.unix(parseInt(dateString, 10)).toDate());
    } else if (isTimestamp(dateString)) {
        return formatDate(dayjs(parseInt(dateString, 10)).toDate());
    }
    return formatDate(dayjs(dateString).toDate());
}
