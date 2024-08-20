'use client';

import { useConnectModal } from '@rainbow-me/rainbowkit';
import { forwardRef } from 'react';

import { useRainbowModal } from '@/hooks/useRainbowModal.js';
import type { SingletonModalRefCreator } from '@/libs/SingletonModal.js';

export const ConnectModal = forwardRef<SingletonModalRefCreator>(function ConnectModal(_, ref) {
    const { openConnectModal, connectModalOpen } = useConnectModal();

    useRainbowModal(openConnectModal, connectModalOpen, ref);

    return null;
});
