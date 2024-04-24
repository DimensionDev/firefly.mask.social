import { t } from '@lingui/macro';
import type { SingletonModalRefCreator } from '@masknet/shared-base';
import { forwardRef, useEffect } from 'react';
import { useAsyncFn } from 'react-use';

import { ConfirmModalRef } from '@/modals/controls.js';
import type { Session } from '@/providers/types/Session.js';
import { useSyncSessionStore } from '@/store/useSyncSessionStore.js';

export const SessionRecoveryModal = forwardRef<SingletonModalRefCreator>(function SessionRecoveryModal(_, ref) {
    const { synced } = useSyncSessionStore();

    const [state, onSessionRecovery] = useAsyncFn(async (sessions: Session[]) => {
        if (!sessions.length) return;

        const confirmed = await ConfirmModalRef.openAndWaitForClose({
            title: t`Device Logged In`,
            content: (
                <div>
                    <p className=" text-main">{t`One click to connect your account status`}</p>
                </div>
            ),
        });

        if (!confirmed) return;
    }, []);

    useEffect(() => {
        onSessionRecovery(synced);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [synced]);

    return null;
});
