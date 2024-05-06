import { t } from '@lingui/macro';
import type { SingletonModalRefCreator } from '@masknet/shared-base';
import { useSingletonModal } from '@masknet/shared-base-ui';
import { forwardRef } from 'react';

import { ConfirmModalRef } from '@/modals/controls.js';
import { syncSessionFromFirefly } from '@/services/syncSessionFromFirefly.js';

export interface FireflySessionConfirmModalProps {}

// true - indicates the user restored sessions
// false - indicates the users rejected the session restore
export type FireflySessionCloseConfirmModalProps = boolean;

export const FireflySessionConfirmModal = forwardRef<
    SingletonModalRefCreator<void, FireflySessionCloseConfirmModalProps>
>(function FireflySessionModal(_, ref) {
    const [open, dispatch] = useSingletonModal(ref, {
        async onOpen() {
            // firefly session has been created
            try {
                const sessions = await syncSessionFromFirefly();
                const confirmed = await ConfirmModalRef.openAndWaitForClose({
                    title: t`Device Logged In`,
                    content: (
                        <div className="text-[15px] font-medium leading-normal text-lightMain">
                            <p>One click to connect your account status.</p>
                        </div>
                    ),
                    enableCancelButton: true,
                    cancelButtonText: t`Skip for now`,
                });

                console.log('DEBUG: restored sessions');
                console.log(sessions);

                if (confirmed) {
                    sessions.forEach((session) => {
                        // restore session directly
                    });
                }

                dispatch?.close(confirmed);
            } catch (error) {
                console.error('[restore firefly session] Failed to restore sessions from Firefly:', error);
                dispatch?.close(false);
            }
        },
    });

    return null;
});
