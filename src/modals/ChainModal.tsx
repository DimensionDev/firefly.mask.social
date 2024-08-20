import { useChainModal } from '@rainbow-me/rainbowkit';
import { forwardRef } from 'react';

import { useRainbowKitModal } from '@/hooks/useRainbowKitModal.js';
import type { SingletonModalRefCreator } from '@/libs/SingletonModal.js';

export const ChainModal = forwardRef<SingletonModalRefCreator>(function ChainModal(_, ref) {
    const { openChainModal, chainModalOpen } = useChainModal();

    useRainbowKitModal(openChainModal, chainModalOpen, ref);

    return null;
});
