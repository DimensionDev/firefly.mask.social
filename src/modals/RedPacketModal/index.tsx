'use client';

import { createMemoryHistory, createRouter, RouterProvider } from '@tanstack/react-router';
import { forwardRef, useRef } from 'react';

import { Modal } from '@/components/Modal.js';
import { useSingletonModal } from '@/hooks/useSingletonModal.js';
import type { SingletonModalRefCreator } from '@/libs/SingletonModal.js';
import { MainView } from '@/modals/RedPacketModal/MainView.js';
import { RedPacketProvider } from '@/modals/RedPacketModal/RedPacketContext.js';
import { routeTree } from '@/modals/RedPacketModal/routes.js';

function createRedPacketRouter() {
    const memoryHistory = createMemoryHistory({
        initialEntries: ['/main'],
    });

    return createRouter({
        routeTree,
        history: memoryHistory,
        defaultPendingMinMs: 200,
        defaultPendingComponent: MainView,
    });
}

export interface RedPacketModalOpenProps {}

export const RedPacketModal = forwardRef<SingletonModalRefCreator<RedPacketModalOpenProps | void>>(
    function RedPacketModal(_, ref) {
        const routerRef = useRef(createRedPacketRouter());
        const [open, dispatch] = useSingletonModal(ref, {
            onOpen: async (props) => {
                routerRef.current = createRedPacketRouter();
                routerRef.current.history.push('/main');
            },
        });

        const Router = <RouterProvider router={routerRef.current} />;

        return (
            <Modal open={open} onClose={() => dispatch?.close()}>
                <div>
                    <RedPacketProvider>{Router}</RedPacketProvider>
                </div>
            </Modal>
        );
    },
);
