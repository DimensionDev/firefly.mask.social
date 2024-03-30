'use client';

import { useEffect, useMemo } from 'react';

import { isEmptyPost } from '@/helpers/isEmptyPost.js';
import { useComposeStateStore } from '@/store/useComposeStore.js';

const handleBeforeUnload = (event: BeforeUnloadEvent) => {
    event.preventDefault();
    event.returnValue = true;
};

export function BeforeUnload() {
    const { posts } = useComposeStateStore();
    const shouldPreventUnload = useMemo(() => posts.some((post) => !isEmptyPost(post)), [posts]);

    useEffect(() => {
        if (shouldPreventUnload) {
            window.addEventListener('beforeunload', handleBeforeUnload);
        } else {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        }

        return () => {
            if (!shouldPreventUnload) return;
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [shouldPreventUnload]);

    return null;
}
