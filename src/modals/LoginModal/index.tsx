import { createMemoryHistory, createRouter, RouterProvider } from '@tanstack/react-router';
import { forwardRef, useRef } from 'react';
import urlcat from 'urlcat';

import { Modal } from '@/components/Modal.js';
import { Popover } from '@/components/Popover.js';
import { AsyncStatus, type FarcasterSignType, type ProfileSource } from '@/constants/enum.js';
import { restoreCurrentAccounts } from '@/helpers/account.js';
import { resolveSourceFromProfileSource } from '@/helpers/resolveSource.js';
import { resolveSourceInURL } from '@/helpers/resolveSourceInURL.js';
import { useAbortController } from '@/hooks/useAbortController.js';
import { useIsMedium } from '@/hooks/useMediaQuery.js';
import { useSingletonModal } from '@/hooks/useSingletonModal.js';
import type { SingletonModalRefCreator } from '@/libs/SingletonModal.js';
import { routeTree } from '@/modals/LoginModal/routes.js';
import { useGlobalState } from '@/store/useGlobalStore.js';

function createLoginRouter() {
    const memoryHistory = createMemoryHistory({
        initialEntries: ['/main'],
    });

    const router = createRouter({
        routeTree,
        history: memoryHistory,
        defaultPendingMinMs: 0,
    });

    return router;
}

export interface LoginModalOpenProps {
    source?: ProfileSource;
    options?: {
        /**
         * profile id of expected profile.
         * The expected profile will be place at the top of the list.
         */
        expectedProfile?: string;
        /** open the farcaster login modal with the specified sign type */
        expectedSignType?: FarcasterSignType;
    };
}

export const LoginModal = forwardRef<SingletonModalRefCreator<LoginModalOpenProps | void>>(function LoginModal(_, ref) {
    const isMedium = useIsMedium();
    const routerRef = useRef(createLoginRouter());

    const controller = useAbortController();
    const { setAsyncStatus } = useGlobalState();

    const [open, dispatch] = useSingletonModal(ref, {
        // open the modal in async way breaks the singleton modal logic.
        // it requires that the login modal always open at the end of the process.
        onOpen: async (props) => {
            // abort previous login process
            controller.current.abort();

            const profileSource = props ? props.source : null;

            if (profileSource) {
                const source = resolveSourceFromProfileSource(profileSource);

                try {
                    setAsyncStatus(source, AsyncStatus.Pending);

                    const confirmed = await restoreCurrentAccounts(controller.current.signal);
                    if (confirmed) return;
                } catch (error) {
                    console.error(`[LoginModal] failed to restore current accounts`, error);

                    // if any error occurs, we will just proceed with the login
                } finally {
                    setAsyncStatus(source, AsyncStatus.Idle);
                }
            }

            routerRef.current = createLoginRouter();

            if (!props?.source) {
                routerRef.current.history.push('/main');
            } else {
                const path = urlcat(`/${resolveSourceInURL(props.source)}`, props.options ?? {});
                routerRef.current.history.push(path);
            }
        },
    });

    if (isMedium) {
        return (
            <Modal open={open} onClose={() => dispatch?.close()}>
                <div>
                    <RouterProvider router={routerRef.current} />
                </div>
            </Modal>
        );
    }

    return (
        <Popover open={open} onClose={() => dispatch?.close()} DialogPanelProps={{ className: '!p-0 !pt-6' }}>
            <RouterProvider router={routerRef.current} />
        </Popover>
    );
});
