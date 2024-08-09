import { delay } from '@masknet/kit';
import { createMemoryHistory, createRouter, RouterProvider } from '@tanstack/react-router';
import { forwardRef, memo } from 'react';
import urlcat from 'urlcat';

import { Modal } from '@/components/Modal.js';
import { Popover } from '@/components/Popover.js';
import type { FarcasterSignType, ProfileSource } from '@/constants/enum.js';
import { resolveSourceInURL } from '@/helpers/resolveSourceInURL.js';
import { useIsMedium } from '@/hooks/useMediaQuery.js';
import { useSingletonModal } from '@/hooks/useSingletonModal.js';
import type { SingletonModalRefCreator } from '@/libs/SingletonModal.js';
import { routeTree } from '@/modals/LoginModal/routes.js';

const memoryHistory = createMemoryHistory({
    initialEntries: ['/main'],
});

const router = createRouter({
    routeTree,
    history: memoryHistory,
});

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
export const LoginModal = memo(
    forwardRef<SingletonModalRefCreator<LoginModalOpenProps | void>>(function LoginModal(_, ref) {
        const isMedium = useIsMedium();
        const { history } = router;

        const [open, dispatch] = useSingletonModal(ref, {
            onOpen: (props) => {
                if (!props?.source) {
                    history.replace('/main');
                    return;
                }
                const url = urlcat('/:source', {
                    ...props.options,
                    source: resolveSourceInURL(props.source),
                });
                history.push(url);
            },
            onClose: async () => {
                // wait for dropdown animation
                if (!isMedium) await delay(300);

                history.flush();
                history.push('/main');
            },
        });

        if (isMedium) {
            return (
                <Modal open={open} onClose={() => dispatch?.close()}>
                    <div>
                        <RouterProvider router={router} />
                    </div>
                </Modal>
            );
        }

        return (
            <Popover open={open} onClose={() => dispatch?.close()}>
                <div>
                    <RouterProvider router={router} />
                </div>
            </Popover>
        );
    }),
);
