import { useChainModal } from '@rainbow-me/rainbowkit';
import { forwardRef } from 'react';

import { useRainbowModal } from '@/hooks/useRainbowModal.js';
import type { SingletonModalRefCreator } from '@/libs/SingletonModal.js';

export const ChainModal = forwardRef<SingletonModalRefCreator>(function ChainModal(_, ref) {
    const { openChainModal, chainModalOpen } = useChainModal();

    useRainbowModal(openChainModal, chainModalOpen, ref);

    return null;
});
