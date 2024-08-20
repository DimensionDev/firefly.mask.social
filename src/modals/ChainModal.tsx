import { useChainModal } from '@rainbow-me/rainbowkit';
import { forwardRef } from 'react';

import { useAppKitWallet } from '@/hooks/useAppKitWallet.js';
import type { SingletonModalRefCreator } from '@/libs/SingletonModal.js';

export const ChainModal = forwardRef<SingletonModalRefCreator>(function ChainModal(_, ref) {
    const { openChainModal, chainModalOpen } = useChainModal();

    useAppKitWallet(openChainModal, chainModalOpen, ref);

    return null;
});
