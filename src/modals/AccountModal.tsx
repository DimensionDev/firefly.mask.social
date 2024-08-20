import { useAccountModal } from '@rainbow-me/rainbowkit';
import { forwardRef } from 'react';

import { useRainbowKitModal } from '@/hooks/useRainbowKitModal.js';
import type { SingletonModalRefCreator } from '@/libs/SingletonModal.js';

export const AccountModal = forwardRef<SingletonModalRefCreator>(function AccountModal(_, ref) {
    const { openAccountModal, accountModalOpen } = useAccountModal();

    useRainbowKitModal(openAccountModal, accountModalOpen, ref);

    return null;
});
