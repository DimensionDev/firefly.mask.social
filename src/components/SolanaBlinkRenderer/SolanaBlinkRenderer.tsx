'use client';

import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';

import { ActionContainer } from '@/components/SolanaBlinkRenderer/ui/ActionContainer.js';
import { SolanaBlinksLoader } from '@/providers/solana-blink/SolanaBlinks.js';
import type { Action } from '@/providers/solana-blink/type.js';

export function SolanaBlinkRenderer(props: { url: string; onData?: (data: Action) => void }) {
    const query = useQuery({
        queryKey: ['blink', props.url],
        queryFn: async () => {
            return SolanaBlinksLoader.fetch(props.url);
        },
    });
    useEffect(() => {
        if (query.data) {
            props.onData?.(query.data);
        }
    }, [query.data]);

    if (!query.data) return null;
    const url = new URL(props.url);

    return <ActionContainer action={query.data} websiteText={url.hostname} websiteUrl={props.url} />;
}
