import { t } from '@lingui/macro';
import type { SingletonModalRefCreator } from '@masknet/shared-base';
import { forwardRef } from 'react';
import { useAsyncFn } from 'react-use';

import { ConfirmModalRef } from '@/modals/controls.js';

export const SessionRecoveryModal = forwardRef<SingletonModalRefCreator>(function SessionRecoveryModal(_, ref) {
    const [state, onSessionRecovery] = useAsyncFn(async () => {
        const confirmed = await ConfirmModalRef.openAndWaitForClose({
            title: t`Device Logged In`,
            content: (
                <div>
                    <p>{t`One click to connect your account status`}</p>
                </div>
            ),
        });

        if (confirmed) {
            // do something
        }
    }, []);
    return null;
});
