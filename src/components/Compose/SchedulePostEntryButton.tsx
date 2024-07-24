import { Trans } from '@lingui/macro';
import dayjs from 'dayjs';
import { type HTMLProps, useCallback } from 'react';

import ScheduleIcon from '@/assets/schedule.svg';
import { SchedulePostSettings } from '@/components/Compose/SchedulePostSettings.js';
import { classNames } from '@/helpers/classNames.js';
import { useIsMedium } from '@/hooks/useMediaQuery.js';
import { DraggablePopoverRef, SchedulePostModalRef } from '@/modals/controls.js';
import { useComposeScheduleStateStore } from '@/store/useComposeScheduleStore.js';

interface SchedulePostEntryButtonProps extends HTMLProps<HTMLDivElement> {
    showText?: boolean;
}

export function SchedulePostEntryButton({ className, showText }: SchedulePostEntryButtonProps) {
    const isMedium = useIsMedium();
    const { scheduleTime } = useComposeScheduleStateStore();

    const handleClick = useCallback(() => {
        const action = scheduleTime ? 'update' : 'create';

        if (isMedium) {
            SchedulePostModalRef.open({
                action,
            });
        } else {
            DraggablePopoverRef.open({
                content: <SchedulePostSettings action={action} onClose={() => DraggablePopoverRef.close()} />,
                enableOverflow: false,
            });
        }
    }, [scheduleTime, isMedium]);

    if (showText) {
        return (
            <div className="mb-3 flex items-center gap-[10px] text-[13px] text-second" onClick={handleClick}>
                <ScheduleIcon className={classNames('cursor-pointer', className)} />
                <span>
                    <Trans>
                        Will send on{' '}
                        <span>
                            {dayjs(scheduleTime).format('ddd, MMM DD, YYYY')} at{' '}
                            <span>{dayjs(scheduleTime).format('hh:mm A')}</span>
                        </span>
                    </Trans>
                </span>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-[10px] text-[13px] text-second">
            <ScheduleIcon className={classNames('cursor-pointer', className)} onClick={handleClick} />
        </div>
    );
}
