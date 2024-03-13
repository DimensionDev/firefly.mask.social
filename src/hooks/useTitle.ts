'use client';

import { useMount } from 'react-use';

import { useNavigatorState } from '@/store/useNavigatorStore.js';

export function useTitle(title: string) {
    const updateTitle = useNavigatorState.use.updateTitle();

    useMount(() => {
        if (title) updateTitle(title);
    });
}
