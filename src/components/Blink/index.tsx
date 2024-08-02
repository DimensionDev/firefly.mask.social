'use client';

import { useQuery } from '@tanstack/react-query';
import { memo, useEffect } from 'react';

import { ActionContainer } from '@/components/Blink/ActionContainer.js';
import type { Post } from '@/providers/types/SocialMedia.js';
import { getPostBlinkAction } from '@/services/getPostLink.js';
import type { Action } from '@/types/blink.js';

interface Props {
    post: Post;
    children?: React.ReactNode;
    onData?: (data: Action) => void;
    onFailed?: (error: Error) => void;
}

export const Blink = memo<Props>(function Blink({ post, onData, onFailed, children }) {
    const {
        data: action,
        error,
        isLoading,
    } = useQuery({
        queryKey: ['action', post.postId],
        queryFn: () => getPostBlinkAction(post),
        retry: false,
        refetchOnMount: false,
        refetchOnWindowFocus: false,
    });

    useEffect(() => {
        if (action) onData?.(action);
    }, [onData, action]);

    useEffect(() => {
        if (error) onFailed?.(error);
    }, [onFailed, error]);

    if (isLoading) return null;
    if (error || !action) return children;

    return <ActionContainer action={action} />;
});
