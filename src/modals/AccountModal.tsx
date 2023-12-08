import type { SingletonModalRefCreator } from '@masknet/shared-base';
import { useAccountModal } from '@rainbow-me/rainbowkit';
import { forwardRef } from 'react';

import { useRainbowModalRef } from '@/hooks/useRainbowModalRef.js';

export const AccountModal = forwardRef<SingletonModalRefCreator>(function AccountModal(_, ref) {
    const { openAccountModal, accountModalOpen } = useAccountModal();

    useRainbowModalRef(openAccountModal, accountModalOpen, ref);

    return null;
});
