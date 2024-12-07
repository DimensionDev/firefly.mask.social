'use client';

import { createMemoryHistory, createRouter, RouterProvider } from '@tanstack/react-router';
import { forwardRef, useRef } from 'react';

import { Modal } from '@/components/Modal.js';
import { useSingletonModal } from '@/hooks/useSingletonModal.js';
import type { SingletonModalRefCreator } from '@/libs/SingletonModal.js';
import { MainView } from '@/modals/RedpacketModal/MainView.js';
import { RedpacketProvider } from '@/modals/RedpacketModal/RedpacketContext.js';
import { routeTree } from '@/modals/RedpacketModal/routes.js';

function createRedpacketRouter() {
    const memoryHistory = createMemoryHistory({
        initialEntries: ['/main'],
    });

    return createRouter({
        routeTree,
        history: memoryHistory,
        defaultPendingMinMs: 0,
        defaultPendingComponent: MainView,
    });
}

export interface RedpacketModalOpenProps {}

export const RedpacketModal = forwardRef<SingletonModalRefCreator<RedpacketModalOpenProps | void>>(
    function RedpacketModal(_, ref) {
        const routerRef = useRef(createRedpacketRouter());
        const [open, dispatch] = useSingletonModal(ref, {
            onOpen: async (props) => {
                routerRef.current = createRedpacketRouter();
                routerRef.current.history.push('/main');
            },
        });

        const Router = <RouterProvider router={routerRef.current} />;

        return (
            <Modal open={open} onClose={() => dispatch?.close()}>
                <div>
                    <RedpacketProvider>{Router}</RedpacketProvider>
                </div>
            </Modal>
        );
    },
);
