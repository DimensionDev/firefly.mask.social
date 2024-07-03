'use client';

import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';

import { ActionContainer } from '@/components/Blink/ActionContainer.js';
import { BlinkLoader } from '@/providers/blink/Loader.js';
import type { Action } from '@/types/blink.js';

export function Blink(props: { url: string; onData?: (data: Action) => void }) {
    const { data } = useQuery({
        queryKey: ['blink', props.url],
        queryFn: async () => {
            return BlinkLoader.fetchAction(props.url);
        },
    });
    useEffect(() => {
        if (data) {
            props.onData?.(data);
        }
    }, [props, data]);

    if (!data) return null;

    return <ActionContainer action={data} />;
}
