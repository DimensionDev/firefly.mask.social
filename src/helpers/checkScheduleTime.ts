import { t } from '@lingui/macro';
import dayjs from 'dayjs';

import { CreateScheduleError } from '@/constants/error.js';

export function checkScheduleTime(scheduleTime: Date) {
    if (dayjs().add(7, 'day').isBefore(scheduleTime)) {
        throw new CreateScheduleError(t`Up to 7 days can be set as the scheduled time.`);
    } else if (dayjs().isAfter(scheduleTime, 'minute')) {
        throw new CreateScheduleError(`The scheduled time has passed.`);
    }
}
