import { t, Trans } from '@lingui/macro';
import dayjs from 'dayjs';
import { memo, useState } from 'react';
import { useAsyncFn } from 'react-use';

import CalendarIcon from '@/assets/calendar.svg';
import LoadingIcon from '@/assets/loading.svg';
import TimerIcon from '@/assets/timer.svg';
import { ClickableButton } from '@/components/ClickableButton.js';
import { DatePicker } from '@/components/DatePicker.js';
import { TimePicker } from '@/components/TimePicker.js';
import { queryClient } from '@/configs/queryClient.js';
import { enqueueErrorMessage } from '@/helpers/enqueueMessage.js';
import { getSnackbarMessageFromError } from '@/helpers/getSnackbarMessageFromError.js';
import { fireflySessionHolder } from '@/providers/firefly/SessionHolder.js';
import { FireflySocialMediaProvider } from '@/providers/firefly/SocialMedia.js';
import type { ScheduleTask } from '@/providers/types/Firefly.js';
import { useComposeScheduleStateStore } from '@/store/useComposeScheduleStore.js';

interface SchedulePostSettingProps {
    task?: ScheduleTask;
    action: 'create' | 'update';
    onClose: () => void;
}

export const SchedulePostSetting = memo<SchedulePostSettingProps>(function SchedulePostSetting({
    task,
    action,
    onClose,
}) {
    const { updateScheduleTime, clearScheduleTime, scheduleTime } = useComposeScheduleStateStore();

    const [value, setValue] = useState(task ? dayjs(task.publish_timestamp).toDate() : scheduleTime ?? new Date());

    const [{ loading }, handleSet] = useAsyncFn(async () => {
        try {
            if (dayjs(value).isBefore(new Date())) {
                enqueueErrorMessage(t`The scheduled time has passed. Please reset it.`);
                return;
            }

            if (task) {
                const result = await FireflySocialMediaProvider.updateScheduledPost(task.uuid, value);
                if (!result) return;
                queryClient.refetchQueries({
                    queryKey: ['schedule-tasks', fireflySessionHolder.session?.profileId],
                });
            } else {
                updateScheduleTime(value);
            }

            onClose();
        } catch (error) {
            enqueueErrorMessage(getSnackbarMessageFromError(error, t`Failed to set schedule time`), {
                error,
            });
            throw error;
        }
    }, [value, task, onClose]);

    return (
        <div className="flex-col px-4 py-2 pb-6 text-main max-md:px-0 max-md:pb-2">
            <div className="text-center text-[15px] leading-[18px]">
                <Trans>The scheduled time to send this post can be set up to 7 days in advance.</Trans>
            </div>
            <div className="flex gap-4 pt-3">
                <DatePicker
                    className="flex w-full gap-3 rounded-2xl bg-bg px-4 py-3 text-main"
                    minDate={dayjs()}
                    maxDate={dayjs().add(7, 'day')}
                    value={dayjs(value)}
                    containerClassName="flex-1"
                    onChange={(value) => {
                        setValue(value.toDate());
                    }}
                    panelClassName="translate-y-[0%]"
                >
                    <CalendarIcon />
                    <span className="max-md:text-sm">{dayjs(value).format('MMM D')}</span>
                </DatePicker>

                <TimePicker
                    value={dayjs(value)}
                    ampm={false}
                    timeSteps={{ minutes: 1 }}
                    containerClassName="flex-1"
                    className="flex w-full gap-3 rounded-2xl bg-bg px-4 py-3 text-main"
                    panelClassName="translate-y-[0%]"
                    onChange={(value) => {
                        setValue((prev) => {
                            return dayjs(prev).hour(value.get('hour')).minute(value.get('minute')).toDate();
                        });
                    }}
                >
                    <TimerIcon className="pointer-events-none text-main" />
                    <span className="max-md:text-sm">{dayjs(value).format('hh:mm A')}</span>
                </TimePicker>
            </div>

            <div className="flex gap-[6px] pt-3 max-md:flex-col">
                {action === 'create' ? (
                    <ClickableButton
                        onClick={handleSet}
                        className="flex flex-1 items-center justify-center rounded-full bg-main py-2 font-bold text-primaryBottom"
                    >
                        <Trans>Set</Trans>
                    </ClickableButton>
                ) : (
                    <>
                        {!task && action === 'update' ? (
                            <ClickableButton
                                onClick={() => {
                                    clearScheduleTime();
                                }}
                                className="flex flex-1 items-center justify-center rounded-full border border-lightMain py-2 font-bold text-fourMain"
                            >
                                <Trans>Clear</Trans>
                            </ClickableButton>
                        ) : null}
                        <ClickableButton
                            onClick={handleSet}
                            className="flex flex-1 items-center justify-center gap-2 rounded-full bg-main py-2 font-bold text-primaryBottom"
                        >
                            {loading ? <LoadingIcon width={16} height={16} className="animate-spin" /> : null}
                            <Trans>Update</Trans>
                        </ClickableButton>
                    </>
                )}
            </div>
        </div>
    );
});
