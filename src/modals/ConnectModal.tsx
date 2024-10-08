'use client';

import { useWeb3Modal, useWeb3ModalState } from '@web3modal/wagmi/react';
import { forwardRef } from 'react';

import { useWalletModal } from '@/hooks/useWalletModal.js';
import type { SingletonModalRefCreator } from '@/libs/SingletonModal.js';

export const ConnectModal = forwardRef<SingletonModalRefCreator>(function ConnectModal(_, ref) {
    const { open: opened } = useWeb3ModalState();
    const { open } = useWeb3Modal();

    const openModal = () => {
        open({
            view: 'Connect',
        });
    };

    const getModalOpened = () => {
        return opened;
    };

    useWalletModal(openModal, getModalOpened(), ref);

    return null;
});
