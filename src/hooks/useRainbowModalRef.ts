import { useCallback } from 'react';

export function useRainbowModalRef(openModal: (() => void) | undefined, open: boolean) {
    return useCallback(
        () => ({
            openModal,
            open,
        }),
        [openModal, open],
    );
}
