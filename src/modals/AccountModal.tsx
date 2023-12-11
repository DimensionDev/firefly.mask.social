import type { SingletonModalRefCreator } from '@masknet/shared-base';
import { useAccountModal } from '@rainbow-me/rainbowkit';
import { forwardRef } from 'react';

import { useRainbowModal } from '@/hooks/useRainbowModal.js';

export const AccountModal = forwardRef<SingletonModalRefCreator>(function AccountModal(_, ref) {
    const { openAccountModal, accountModalOpen } = useAccountModal();

    useRainbowModal(openAccountModal, accountModalOpen, ref);

    return null;
});
