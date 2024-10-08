'use client';

import { useEffect } from 'react';

import { useNavigatorState } from '@/store/useNavigatorStore.js';

export function useNavigatorTitle(title: string) {
    const updateTitle = useNavigatorState.use.updateTitle();

    useEffect(() => {
        if (title) updateTitle(title);
        return () => {
            updateTitle('');
        };
    }, [title, updateTitle]);
}
