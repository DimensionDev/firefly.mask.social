import type { SingletonModalRefCreator } from '@masknet/shared-base';
import { useChainModal } from '@rainbow-me/rainbowkit';
import { forwardRef } from 'react';

import { useRainbowModal } from '@/hooks/useRainbowModal.js';

export const ChainModal = forwardRef<SingletonModalRefCreator>(function ChainModal(_, ref) {
    const { openChainModal, chainModalOpen } = useChainModal();

    useRainbowModal(openChainModal, chainModalOpen, ref);

    return null;
});
