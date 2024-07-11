import type { HTMLProps } from 'react';

import ScheduleIcon from '@/assets/schedule.svg';
import { SchedulePostSettings } from '@/components/Compose/SchedulePostSettings.js';
import { classNames } from '@/helpers/classNames.js';
import { useIsMedium } from '@/hooks/useMediaQuery.js';
import { DraggablePopoverRef, SchedulePostModalRef } from '@/modals/controls.js';
import { useComposeScheduleStateStore } from '@/store/useComposeScheduleStore.js';

interface SchedulePostEntryButtonProps extends HTMLProps<HTMLDivElement> {}

export function SchedulePostEntryButton({ className }: SchedulePostEntryButtonProps) {
    const isMedium = useIsMedium();
    const { scheduleTime } = useComposeScheduleStateStore();

    return (
        <ScheduleIcon
            className={classNames('cursor-pointer', className)}
            onClick={() => {
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
            }}
        />
    );
}
