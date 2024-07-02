'use client';

import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';

import { ActionContainer } from '@/components/Blink/ActionContainer.js';
import { BlinkLoader } from '@/providers/blink/Loader.js';
import type { Action } from '@/providers/types/Blink.js';

export function BlinkWithQuery(props: { url: string; onData?: (data: Action) => void }) {
    const query = useQuery({
        queryKey: ['blink', props.url],
        queryFn: async () => {
            return BlinkLoader.fetchAction(props.url);
        },
    });
    useEffect(() => {
        if (query.data) {
            props.onData?.(query.data);
        }
    }, [props, query.data]);

    if (!query.data) return null;

    return <ActionContainer action={query.data} />;
}
