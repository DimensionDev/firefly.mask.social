import type { SingletonModalRefCreator } from '@masknet/shared-base';
import { useSingletonModal } from '@masknet/shared-base-ui';
import { type ForwardedRef, useEffect, useRef } from 'react';

export function useRainbowModal(
    openModal: (() => void) | undefined,
    open: boolean,
    singletonModalRef: ForwardedRef<SingletonModalRefCreator>,
) {
    const [, dispatch] = useSingletonModal(singletonModalRef, {
        onOpen() {
            resolvedOpenRef.current = true;
            openModal?.();
        },
    });
    const resolvedOpenRef = useRef(false);

    useEffect(() => {
        if (!open) {
            resolvedOpenRef.current = false;
            dispatch?.close();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);
}
