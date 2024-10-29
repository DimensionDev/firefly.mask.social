import type { ConfigType } from 'dayjs';
import dayjs from 'dayjs';

export function isTomorrow(value: ConfigType) {
    const tomorrow = dayjs().add(1, 'day');
    return dayjs(value).isSame(tomorrow, 'day');
}
