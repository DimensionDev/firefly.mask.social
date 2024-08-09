import { createMemoryHistory, createRouter, RouterProvider } from '@tanstack/react-router';
import { forwardRef, useRef } from 'react';
import urlcat from 'urlcat';

import { Modal } from '@/components/Modal.js';
import { Popover } from '@/components/Popover.js';
import type { FarcasterSignType, ProfileSource } from '@/constants/enum.js';
import { resolveSourceInURL } from '@/helpers/resolveSourceInURL.js';
import { useIsMedium } from '@/hooks/useMediaQuery.js';
import { useSingletonModal } from '@/hooks/useSingletonModal.js';
import type { SingletonModalRefCreator } from '@/libs/SingletonModal.js';
import { routeTree } from '@/modals/LoginModal/routes.js';

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

    const [open, dispatch] = useSingletonModal(ref, {
        onOpen: (props) => {
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
        <Popover open={open} onClose={() => dispatch?.close()}>
            <div>
                <RouterProvider router={routerRef.current} />
            </div>
        </Popover>
    );
});
