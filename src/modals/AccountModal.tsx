import { useAppKit, useAppKitState } from '@reown/appkit/react';
import { forwardRef } from 'react';

import { useWalletModal } from '@/hooks/useWalletModal.js';
import type { SingletonModalRefCreator } from '@/libs/SingletonModal.js';

export const AccountModal = forwardRef<SingletonModalRefCreator>(function AccountModal(_, ref) {
    const { open } = useAppKit();
    const state = useAppKitState();

    const openModal = () => {
        open({
            view: 'Account',
        });
    };

    const getModalOpened = () => {
        return state.open;
    };

    useWalletModal(openModal, getModalOpened(), ref);

    return null;
});
