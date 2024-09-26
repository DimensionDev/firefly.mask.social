import { forwardRef } from 'react';

import { CZActivityClaimSuccessDialog } from '@/components/ActivityPage/CZ/CZActivityClaimSuccessDialog.js';
import { CZActivityDialog } from '@/components/ActivityPage/CZ/CZActivityDialog.js';
import { useSingletonModal } from '@/hooks/useSingletonModal.js';
import type { SingletonModalRefCreator } from '@/libs/SingletonModal.js';

export const CZActivityModal = forwardRef<SingletonModalRefCreator>(function CZActivityModal(_, ref) {
    const [open, dispatch] = useSingletonModal(ref);
    return <CZActivityDialog open={open} onClose={() => dispatch?.close()} />;
});

export const CZActivityClaimSuccessModal = forwardRef<SingletonModalRefCreator>(
    function CZActivityClaimSuccessModal(_, ref) {
        const [open, dispatch] = useSingletonModal(ref);
        return <CZActivityClaimSuccessDialog open={open} onClose={() => dispatch?.close()} />;
    },
);
