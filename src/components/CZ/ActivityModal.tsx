import { forwardRef } from 'react';

import { ActivityClaimSuccessDialog } from '@/components/CZ/ActivityClaimSuccessDialog.js';
import { ActivityDialog } from '@/components/CZ/ActivityDialog.js';
import { useSingletonModal } from '@/hooks/useSingletonModal.js';
import type { SingletonModalRefCreator } from '@/libs/SingletonModal.js';

export const ActivityModal = forwardRef<SingletonModalRefCreator>(function ActivityModal(_, ref) {
    const [open, dispatch] = useSingletonModal(ref);
    return <ActivityDialog open={open} onClose={() => dispatch?.close()} />;
});

export const ActivityClaimSuccessModal = forwardRef<SingletonModalRefCreator>(
    function ActivityClaimSuccessModal(_, ref) {
        const [open, dispatch] = useSingletonModal(ref);
        return <ActivityClaimSuccessDialog open={open} onClose={() => dispatch?.close()} />;
    },
);