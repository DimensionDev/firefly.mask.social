import { Trans } from '@lingui/macro';
import type { SingletonModalRefCreator } from '@masknet/shared-base';
import { useSingletonModal } from '@masknet/shared-base-ui';
import { forwardRef, useState } from 'react';

import { CloseButton } from '@/components/CloseButton.js';
import { SchedulePostSettings } from '@/components/Compose/SchedulePostSettings.js';
import { Modal } from '@/components/Modal.js';
import { stopEvent } from '@/helpers/stopEvent.js';
import type { ScheduleTask } from '@/providers/types/Firefly.js';

export interface SchedulePostModalOpenProps {
    action: 'create' | 'update';
    task?: ScheduleTask;
}

export const SchedulePostModal = forwardRef<SingletonModalRefCreator<SchedulePostModalOpenProps>>(
    function SchedulePostModal(_, ref) {
        const [action, setAction] = useState<'create' | 'update'>('create');

        const [task, setTask] = useState<ScheduleTask>();

        const [open, dispatch] = useSingletonModal(ref, {
            onOpen({ action, task }) {
                setAction(action);
                setTask(task);
            },
        });

        if (!open) return;

        return (
            <Modal open={open} onClose={() => dispatch?.close()}>
                <div
                    className="relative w-[355px] max-w-[90vw] rounded-xl bg-primaryBottom shadow-popover transition-all dark:text-gray-950"
                    onClick={stopEvent}
                >
                    <div className="inline-flex h-14 w-full items-center justify-center gap-2 rounded-t-[12px] p-4">
                        <CloseButton onClick={() => dispatch?.close()} />
                        <div className="shrink grow basis-0 text-center text-lg font-bold leading-snug text-main">
                            <Trans>Schedule Post</Trans>
                        </div>
                        <div className="relative h-6 w-6" />
                    </div>

                    <SchedulePostSettings task={task} action={action} onClose={() => dispatch?.close()} />
                </div>
            </Modal>
        );
    },
);
