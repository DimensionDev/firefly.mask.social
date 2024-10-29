import type { ConfigType } from 'dayjs';
import dayjs from 'dayjs';

export function isToday(value: ConfigType) {
    const today = dayjs();
    return dayjs(value).isSame(today, 'day');
}
