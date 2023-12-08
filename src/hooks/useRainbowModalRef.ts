import type { SingletonModalRefCreator } from '@masknet/shared-base';
import { useSingletonModal } from '@masknet/shared-base-ui';
import { type ForwardedRef, useEffect, useRef } from 'react';

export function useRainbowModalRef(
    openModal: (() => void) | undefined,
    opened: boolean,
    ref: ForwardedRef<SingletonModalRefCreator>,
) {
    const [open, dispatch] = useSingletonModal(ref);
    const resolvedOpenRef = useRef(false);

    useEffect(() => {
        if (open && !resolvedOpenRef.current) {
            resolvedOpenRef.current = true;
            openModal?.();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

    useEffect(() => {
        if (!opened && resolvedOpenRef.current) {
            resolvedOpenRef.current = false;
            dispatch?.close();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [opened]);
}
