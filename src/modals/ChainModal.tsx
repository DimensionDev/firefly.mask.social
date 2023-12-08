import type { SingletonModalRefCreator } from '@masknet/shared-base';
import { useChainModal } from '@rainbow-me/rainbowkit';
import { forwardRef } from 'react';

import { useRainbowModalRef } from '@/hooks/useRainbowModalRef.js';

export const ChainModal = forwardRef<SingletonModalRefCreator>(function ChainModal(_, ref) {
    const { openChainModal, chainModalOpen } = useChainModal();

    useRainbowModalRef(openChainModal, chainModalOpen, ref);

    return null;
});
