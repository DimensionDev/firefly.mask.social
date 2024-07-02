'use client';

import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';

import { ActionContainer } from '@/components/Blink/ui/ActionContainer.js';
import { BlinksLoader } from '@/providers/blinks/Blinks.js';
import type { Action } from '@/providers/blinks/type.js';

export function BlinkWithQuery(props: { url: string; onData?: (data: Action) => void }) {
    const query = useQuery({
        queryKey: ['blink', props.url],
        queryFn: async () => {
            return BlinksLoader.fetchAction(props.url);
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
