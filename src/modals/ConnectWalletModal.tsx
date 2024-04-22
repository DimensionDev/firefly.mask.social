import { useDynamicModals } from '@dynamic-labs/sdk-react-core';
import type { SingletonModalRefCreator } from '@masknet/shared-base';
import { forwardRef, useState } from 'react';

import { useRainbowModal } from '@/hooks/useRainbowModal.js';

export const ConnectWalletModal = forwardRef<SingletonModalRefCreator>(function ConnectWalletModal(_, ref) {
    const [open, setOpen] = useState(false);
    const { setShowLinkNewWalletModal } = useDynamicModals();

    useRainbowModal(
        () => {
            setShowLinkNewWalletModal(true);
            setOpen(true);
        },
        open,
        ref,
    );

    return null;
});
