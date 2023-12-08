import type { SingletonModalRefCreator } from '@masknet/shared-base';
import { useSingletonModal } from '@masknet/shared-base-ui';
import { useChainModal } from '@rainbow-me/rainbowkit';
import { forwardRef, useEffect, useRef } from 'react';

export const ChainModal = forwardRef<SingletonModalRefCreator>(function SwitchChainModal(_, ref) {
    const { openChainModal, chainModalOpen } = useChainModal();

    const [open, dispatch] = useSingletonModal(ref);
    const resolvedOpenRef = useRef(false);

    useEffect(() => {
        if (open && !resolvedOpenRef.current) {
            resolvedOpenRef.current = true;
            openChainModal?.();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

    useEffect(() => {
        if (!chainModalOpen && resolvedOpenRef.current) {
            resolvedOpenRef.current = false;
            dispatch?.close();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [chainModalOpen]);

    return null;
});
