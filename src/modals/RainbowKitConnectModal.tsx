'use client';

import { useConnectModal } from '@rainbow-me/rainbowkit';
import { forwardRef } from 'react';

import { useAppKitWallet } from '@/hooks/useAppKitWallet.js';
import type { SingletonModalRefCreator } from '@/libs/SingletonModal.js';

export const RainbowKitConnectModal = forwardRef<SingletonModalRefCreator>(function RainbowKitConnectModal(_, ref) {
    const { openConnectModal, connectModalOpen } = useConnectModal();

    useAppKitWallet(openConnectModal, connectModalOpen, ref);

    return null;
});
