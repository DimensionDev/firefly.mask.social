import { t } from '@lingui/macro';
import dayjs from 'dayjs';
import { useAsyncFn } from 'react-use';

import { enqueueErrorMessage } from '@/helpers/enqueueMessage.js';
import { getSnackbarMessageFromError } from '@/helpers/getSnackbarMessageFromError.js';
import { SchedulePostModalRef } from '@/modals/controls.js';
import { useComposeScheduleStateStore } from '@/store/useComposeScheduleStore.js';

export function useScheduleButtonHandler() {
    const { scheduleTime, clearScheduleTime, updateScheduleTime } = useComposeScheduleStateStore();

    return useAsyncFn(async () => {
        try {
            const result = await SchedulePostModalRef.openAndWaitForClose({
                action: scheduleTime ? 'update' : 'create',
                initialValue: scheduleTime,
            });
            if (result === 'clear') clearScheduleTime();
            else if (result) {
                if (dayjs(result).isBefore(new Date())) {
                    enqueueErrorMessage(t`The scheduled time has passed. Please reset it.`);
                    return;
                }
                updateScheduleTime(result);
            }
        } catch (error) {
            enqueueErrorMessage(getSnackbarMessageFromError(error, t`Failed to set schedule time`), {
                error,
            });
            throw error;
        }
    }, [scheduleTime, clearScheduleTime, updateScheduleTime]);
}
