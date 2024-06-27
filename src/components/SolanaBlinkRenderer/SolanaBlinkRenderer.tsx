'use client';

import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';

import { Action } from '@/components/SolanaBlinkRenderer/api/Action.js';
import { ActionConfig, type ActionContext } from '@/components/SolanaBlinkRenderer/api/ActionConfig.js';
import { ActionContainer } from '@/components/SolanaBlinkRenderer/ui/ActionContainer.js';

export function SolanaBlinkRenderer(props: { url: string; onData?: (data: Action) => void }) {
    const query = useQuery({
        queryKey: ['blink'],
        queryFn: async () => {
            const config = new ActionConfig('https://rpc.ankr.com/solana', {
                async connect(context: ActionContext) {
                    // TODO: connect solana wallet
                    return '';
                },
                async signTransaction(tx) {
                    // TODO: signTransaction
                    return { signature: '' };
                },
            });
            return Action.fetch(props.url, config);
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
