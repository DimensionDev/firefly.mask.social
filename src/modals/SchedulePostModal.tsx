import { t, Trans } from '@lingui/macro';
import type { SingletonModalRefCreator } from '@masknet/shared-base';
import { queryClient, useSingletonModal } from '@masknet/shared-base-ui';
import dayjs from 'dayjs';
import { forwardRef, useState } from 'react';
import { useAsyncFn } from 'react-use';

import CalendarIcon from '@/assets/calendar.svg';
import LoadingIcon from '@/assets/loading.svg';
import TimerIcon from '@/assets/timer.svg';
import { ClickableButton } from '@/components/ClickableButton.js';
import { CloseButton } from '@/components/CloseButton.js';
import { DatePicker } from '@/components/DatePicker.js';
import { Modal } from '@/components/Modal.js';
import { TimePicker } from '@/components/TimePicker.js';
import { enqueueErrorMessage } from '@/helpers/enqueueMessage.js';
import { getSnackbarMessageFromError } from '@/helpers/getSnackbarMessageFromError.js';
import { fireflySessionHolder } from '@/providers/firefly/SessionHolder.js';
import { FireflySocialMediaProvider } from '@/providers/firefly/SocialMedia.js';
import type { ScheduleTask } from '@/providers/types/Firefly.js';
import { useComposeScheduleStateStore } from '@/store/useComposeScheduleStore.js';

export interface SchedulePostModalOpenProps {
    action: 'create' | 'update';
    task?: ScheduleTask;
}

export const SchedulePostModal = forwardRef<SingletonModalRefCreator<SchedulePostModalOpenProps>>(
    function SchedulePostModal(_, ref) {
        const { updateScheduleTime, clearScheduleTime } = useComposeScheduleStateStore();

        const [action, setAction] = useState('create');
        const [value, setValue] = useState(new Date());
        const [task, setTask] = useState<ScheduleTask>();

        const [open, dispatch] = useSingletonModal(ref, {
            onOpen({ action, task }) {
                const { scheduleTime } = useComposeScheduleStateStore.getState();
                setAction(action);
                setValue(task ? dayjs(task.publish_timestamp).toDate() : scheduleTime ?? new Date());
                setTask(task);
            },
        });

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

                dispatch?.close();
            } catch (error) {
                enqueueErrorMessage(getSnackbarMessageFromError(error, t`Failed to set schedule time`), {
                    error,
                });
                throw error;
            }
        }, [value, task]);

        return (
            <Modal open={open} onClose={() => dispatch?.close()}>
                <div
                    className="relative w-[355px] max-w-[90vw] rounded-xl bg-bgModal shadow-popover transition-all dark:text-gray-950"
                    onClick={(event) => {
                        event.stopPropagation();
                        event.preventDefault();
                    }}
                >
                    <div className="inline-flex h-14 w-full items-center justify-center gap-2 rounded-t-[12px] p-4">
                        <div className="relative h-6 w-6" />
                        <div className="shrink grow basis-0 text-center text-lg font-bold leading-snug text-main">
                            <Trans>Schedule Post</Trans>
                        </div>

                        <CloseButton onClick={() => dispatch?.close()} />
                    </div>

                    <div className="flex-col px-4 py-2 pb-6 text-main">
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
                            >
                                <CalendarIcon />
                                <span>{dayjs(value).format('MMM D')}</span>
                            </DatePicker>

                            <TimePicker
                                value={dayjs(value)}
                                ampm={false}
                                timeSteps={{ minutes: 1 }}
                                containerClassName="flex-1"
                                className="flex w-full gap-3 rounded-2xl bg-bg px-4 py-3 text-main"
                                onChange={(value) => {
                                    setValue((prev) => {
                                        return dayjs(prev).hour(value.get('hour')).minute(value.get('minute')).toDate();
                                    });
                                }}
                            >
                                <TimerIcon className="pointer-events-none text-main" />
                                <span>{dayjs(value).format('hh:mm A')}</span>
                            </TimePicker>
                        </div>

                        <div className="flex gap-[6px] pt-3">
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
                                        {loading ? (
                                            <LoadingIcon width={16} height={16} className="animate-spin" />
                                        ) : null}
                                        <Trans>Update</Trans>
                                    </ClickableButton>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </Modal>
        );
    },
);
