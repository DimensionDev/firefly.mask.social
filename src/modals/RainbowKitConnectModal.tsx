'use client';

import type { SingletonModalRefCreator } from '@masknet/shared-base';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { forwardRef } from 'react';

import { useRainbowModal } from '@/hooks/useRainbowModal.js';

export const RainbowKitConnectModal = forwardRef<SingletonModalRefCreator>(function RainbowKitConnectModal(_, ref) {
    const { openConnectModal, connectModalOpen } = useConnectModal();

    useRainbowModal(openConnectModal, connectModalOpen, ref);

    return null;
});
