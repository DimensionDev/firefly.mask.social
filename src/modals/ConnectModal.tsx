'use client';

import { useAppKit, useAppKitState } from '@reown/appkit/react';
import { forwardRef } from 'react';

import { useWalletModal } from '@/hooks/useWalletModal.js';
import type { SingletonModalRefCreator } from '@/libs/SingletonModal.js';

export const ConnectModal = forwardRef<SingletonModalRefCreator>(function ConnectModal(_, ref) {
    const state = useAppKitState();
    const { open } = useAppKit();

    const openModal = () => {
        open({
            view: 'Connect',
        });
    };

    const getModalOpened = () => {
        return state.open;
    };

    useWalletModal(openModal, getModalOpened(), ref);

    return null;
});
