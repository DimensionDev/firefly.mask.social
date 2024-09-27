import { useWeb3Modal, useWeb3ModalState } from '@web3modal/wagmi/react';
import { forwardRef } from 'react';

import { useWalletModal } from '@/hooks/useWalletModal.js';
import type { SingletonModalRefCreator } from '@/libs/SingletonModal.js';

export const AccountModal = forwardRef<SingletonModalRefCreator>(function AccountModal(_, ref) {
    const { open: opened } = useWeb3ModalState();
    const { open } = useWeb3Modal();

    const openModal = () => {
        open({
            view: 'Account',
        });
    };

    const getModalOpened = () => {
        return opened;
    };

    useWalletModal(openModal, getModalOpened(), ref);

    return null;
});
