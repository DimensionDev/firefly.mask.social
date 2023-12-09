import type { SingletonModalRefCreator } from '@masknet/shared-base';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { forwardRef } from 'react';

import { useRainbowModalRef } from '@/hooks/useRainbowModalRef.js';

export const ConnectWalletModal = forwardRef<SingletonModalRefCreator>(function ConnectWalletModal(_, ref) {
    const { openConnectModal, connectModalOpen } = useConnectModal();

    useRainbowModalRef(openConnectModal, connectModalOpen, ref);

    return null;
});
