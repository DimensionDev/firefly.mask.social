'use client';

import { forwardRef, useEffect, useState } from 'react';

import { ActivityClaimSuccessDialog } from '@/components/CZ/ActivityClaimSuccessDialog.js';
import { ActivityDialog } from '@/components/CZ/ActivityDialog.js';
import { useSingletonModal } from '@/hooks/useSingletonModal.js';
import type { SingletonModalRefCreator } from '@/libs/SingletonModal.js';

export const ActivityModal = forwardRef<SingletonModalRefCreator>(function ActivityModal(_, ref) {
    const [open, dispatch] = useSingletonModal(ref);
    useEffect(() => {
        const searchParams = new URLSearchParams(window.location.search);
        if (searchParams.get('modal') === 'cz') {
            dispatch?.open();
        }
    }, []);
    return <ActivityDialog open={open} onClose={() => dispatch?.close()} />;
});

export const ActivityClaimSuccessModal = forwardRef<SingletonModalRefCreator<{ hash: string }>>(
    function ActivityClaimSuccessModal(_, ref) {
        const [hash, setHash] = useState('');
        const [open, dispatch] = useSingletonModal(ref, {
            onOpen(props) {
                setHash(props.hash);
            },
        });
        return <ActivityClaimSuccessDialog open={open} onClose={() => dispatch?.close()} hash={hash} />;
    },
);
