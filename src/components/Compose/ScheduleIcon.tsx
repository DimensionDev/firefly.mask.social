import ScheduleSvgIcon from '@/assets/schedule.svg';
import { SchedulePostSetting } from '@/components/Compose/SchedulePostSetting.js';
import { STATUS } from '@/constants/enum.js';
import { env } from '@/constants/env.js';
import { classNames } from '@/helpers/classNames.js';
import { useIsMedium } from '@/hooks/useMediaQuery.js';
import { DraggablePopoverRef, SchedulePostModalRef } from '@/modals/controls.js';
import { useComposeScheduleStateStore } from '@/store/useComposeScheduleStore.js';

export function ScheduleIcon({ className }: { className?: string }) {
    const isMedium = useIsMedium();
    const { scheduleTime } = useComposeScheduleStateStore();
    if (env.external.NEXT_PUBLIC_SCHEDULE_POST !== STATUS.Enabled) return null;

    return (
        <ScheduleSvgIcon
            className={classNames('cursor-pointer', className)}
            onClick={() => {
                const action = scheduleTime ? 'update' : 'create';
                if (isMedium) {
                    SchedulePostModalRef.open({
                        action,
                    });
                } else {
                    DraggablePopoverRef.open({
                        content: <SchedulePostSetting action={action} onClose={() => DraggablePopoverRef.close()} />,
                        enableOverflow: false,
                    });
                }
            }}
        />
    );
}
