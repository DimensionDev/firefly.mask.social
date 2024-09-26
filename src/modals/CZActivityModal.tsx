import { forwardRef } from 'react';

import { CZActivityDialog } from '@/components/ActivityPage/CZ/CZActivityDialog.js';
import { useSingletonModal } from '@/hooks/useSingletonModal.js';
import type { SingletonModalRefCreator } from '@/libs/SingletonModal.js';

export const CZActivityModal = forwardRef<SingletonModalRefCreator>(function CZActivityModal(_, ref) {
    const [open, dispatch] = useSingletonModal(ref, {});
    return <CZActivityDialog open={open} onClose={() => dispatch?.close()} />;
});
