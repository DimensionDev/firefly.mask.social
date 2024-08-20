import { useAccountModal } from '@rainbow-me/rainbowkit';
import { forwardRef } from 'react';

import { useAppKitWallet } from '@/hooks/useAppKitWallet.js';
import type { SingletonModalRefCreator } from '@/libs/SingletonModal.js';

export const AccountModal = forwardRef<SingletonModalRefCreator>(function AccountModal(_, ref) {
    const { openAccountModal, accountModalOpen } = useAccountModal();

    useAppKitWallet(openAccountModal, accountModalOpen, ref);

    return null;
});
