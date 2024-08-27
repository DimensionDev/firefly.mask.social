'use client';

import { Action } from '@dialectlabs/blinks';
import { useQuery } from '@tanstack/react-query';
import { memo, useEffect } from 'react';

import { ActionContainer } from '@/components/Blink/ActionContainer.js';
import { useActionAdapter } from '@/hooks/useActionAdapter.js';
import type { Post } from '@/providers/types/SocialMedia.js';
import { getPostBlinkAction } from '@/services/getPostLinks.js';

interface Props {
    post: Post;
    children?: React.ReactNode;
    onData?: (data: Action) => void;
    onFailed?: (error: Error) => void;
}

export const Blink = memo<Props>(function Blink({ post, onData, onFailed, children }) {
    const url = post.metadata.content?.oembedUrl;
    const actionAdapter = useActionAdapter();
    const {
        data: action,
        error,
        isLoading,
    } = useQuery({
        queryKey: ['action', url],
        queryFn() {
            return getPostBlinkAction(url!);
        },
        retry: false,
        refetchOnMount: false,
        refetchOnWindowFocus: false,
        enabled: !!url,
    });

    useEffect(() => {
        if (action) {
            action.setAdapter(actionAdapter);
        }
    }, [actionAdapter, action]);

    useEffect(() => {
        if (action) onData?.(action);
    }, [onData, action]);

    useEffect(() => {
        if (error) onFailed?.(error);
    }, [onFailed, error]);

    if (isLoading) return null;
    if (error || !action) return children;

    return <>{action ? <ActionContainer action={action} url={url!} /> : null}</>;
});
