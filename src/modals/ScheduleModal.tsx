import { Trans } from '@lingui/macro';
import type { SingletonModalRefCreator } from '@masknet/shared-base';
import { useSingletonModal } from '@masknet/shared-base-ui';
import dayjs from 'dayjs';
import { forwardRef, useCallback, useState } from 'react';

import CalendarIcon from '@/assets/calendar.svg';
import TimerIcon from '@/assets/timer.svg';
import { ClickableButton } from '@/components/ClickableButton.js';
import { CloseButton } from '@/components/CloseButton.js';
import { DatePicker } from '@/components/DatePicker.js';
import { Modal } from '@/components/Modal.js';
import { TimePicker } from '@/components/TimePicker.js';

export interface ScheduleModalOpenProps {
    initialValue?: Date;
    disableClear?: boolean;
    type: 'create' | 'update';
}

export type ScheduleModalCloseProps = 'clear' | Date | void;

export const ScheduleModal = forwardRef<SingletonModalRefCreator<ScheduleModalOpenProps, ScheduleModalCloseProps>>(
    function ScheduleModal(_, ref) {
        // const { updateScheduleTime, clearScheduleTime, scheduleTime } = useComposeStateStore();
        const [type, setType] = useState('create');
        const [value, setValue] = useState(new Date());
        const [disableClear, setDisableClear] = useState(false);

        const [open, dispatch] = useSingletonModal(ref, {
            onOpen({ initialValue, disableClear, type }) {
                // const { scheduleTime } = useComposeStateStore.getState();
                setValue(initialValue ?? new Date());
                setType(type);
                setDisableClear(disableClear ?? false);
            },
            onClose() {
                setValue(new Date());
                setType('create');
                setDisableClear(false);
            },
        });

        const handleSet = useCallback(() => {
            dispatch?.close(value);
        }, [dispatch, value]);

        const handleClear = useCallback(() => {
            dispatch?.close('clear');
        }, [dispatch]);

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
                            <Trans>Up to 7 days can be set as the scheduled time to send this post.</Trans>
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
                            {type === 'create' ? (
                                <ClickableButton
                                    onClick={handleSet}
                                    className="flex flex-1 items-center justify-center rounded-full bg-main py-2 font-bold text-primaryBottom"
                                >
                                    <Trans>Set</Trans>
                                </ClickableButton>
                            ) : (
                                <>
                                    {!disableClear ? (
                                        <ClickableButton
                                            onClick={handleClear}
                                            className="flex flex-1 items-center justify-center rounded-full border border-lightMain py-2 font-bold text-fourMain"
                                        >
                                            <Trans>Clear</Trans>
                                        </ClickableButton>
                                    ) : null}
                                    <ClickableButton
                                        onClick={handleSet}
                                        className="flex flex-1 items-center justify-center rounded-full bg-main py-2 font-bold text-primaryBottom"
                                    >
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
