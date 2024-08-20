'use client';

import { useConnectModal } from '@rainbow-me/rainbowkit';
import { forwardRef } from 'react';

import { useRainbowKitModal } from '@/hooks/useRainbowKitModal.js';
import type { SingletonModalRefCreator } from '@/libs/SingletonModal.js';

export const RainbowKitConnectModal = forwardRef<SingletonModalRefCreator>(function RainbowKitConnectModal(_, ref) {
    const { openConnectModal, connectModalOpen } = useConnectModal();

    useRainbowKitModal(openConnectModal, connectModalOpen, ref);

    return null;
});
