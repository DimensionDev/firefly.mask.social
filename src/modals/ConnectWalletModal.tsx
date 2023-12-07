import type { SingletonModalRefCreator } from '@masknet/shared-base';
import { useSingletonModal } from '@masknet/shared-base-ui';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { forwardRef, useEffect, useRef } from 'react';

export const ConnectWalletModal = forwardRef<SingletonModalRefCreator>(function ConnectWalletModal(_, ref) {
    const { openConnectModal, connectModalOpen } = useConnectModal();

    const [open, dispatch] = useSingletonModal(ref);
    const resolvedOpenRef = useRef(false);

    useEffect(() => {
        if (open && !resolvedOpenRef.current) {
            console.log('DEBUG: open');
            resolvedOpenRef.current = true;
            setTimeout(() => {
                openConnectModal?.();
            }, 0);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

    useEffect(() => {
        if (!connectModalOpen && resolvedOpenRef.current) {
            console.log('DEBUG: close');
            resolvedOpenRef.current = false;
            setTimeout(() => {
                dispatch?.close();
            }, 0);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [connectModalOpen]);

    return null;
});
