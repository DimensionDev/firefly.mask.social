'use client';

import { useQuery } from '@tanstack/react-query';
import { last } from 'lodash-es';
import { memo, useEffect } from 'react';

import { ActionContainer } from '@/components/Blink/ActionContainer.js';
import { BlinkLoader } from '@/providers/blink/Loader.js';
import type { Action } from '@/types/blink.js';

interface Props {
    urls: string[];
    children: React.ReactNode;
    onData?: (data: Action) => void;
}

export const Blink = memo<Props>(function Blink({ urls, onData, children }) {
    const { data, error, isLoading } = useQuery({
        queryKey: ['action', urls],
        queryFn: async () => {
            const url = last(urls);
            if (!url) return null;
            return BlinkLoader.fetchAction(url);
        },
    });

    useEffect(() => {
        if (data) onData?.(data);
    }, [onData, data]);

    const action = data?.error ? null : data;

    if (isLoading) return null;

    if (error || !action) return children;

    return <ActionContainer action={action} />;
});
