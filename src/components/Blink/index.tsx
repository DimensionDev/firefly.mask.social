'use client';

import { useQuery } from '@tanstack/react-query';
import { last } from 'lodash-es';
import { memo, useEffect } from 'react';

import { ActionContainer } from '@/components/Blink/ActionContainer.js';
import { resolveTCOLink } from '@/helpers/resolveTCOLink.js';
import { BlinkLoader } from '@/providers/blink/Loader.js';
import type { Action, ActionScheme } from '@/types/blink.js';

interface Props {
    schemes: ActionScheme[];
    children: React.ReactNode;
    onData?: (data: Action) => void;
}

export const Blink = memo<Props>(function Blink({ schemes, onData, children }) {
    const { data, error, isLoading } = useQuery({
        queryKey: ['action', schemes.map((x) => x.url)],
        queryFn: async () => {
            const scheme = last(schemes);
            if (!scheme) return null;

            return BlinkLoader.fetchAction({
                ...scheme,
                url: (await resolveTCOLink(scheme.url)) ?? scheme.url,
            });
        },
        retry: false,
        refetchOnMount: false,
        refetchOnWindowFocus: false,
    });

    useEffect(() => {
        if (data) onData?.(data);
    }, [onData, data]);

    const action = data?.error ? null : data;

    if (isLoading) return null;
    if (error || !action) return children;

    return <ActionContainer action={action} />;
});
