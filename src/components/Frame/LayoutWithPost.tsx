import { useQuery } from '@tanstack/react-query';
import { memo, type ReactNode, useEffect } from 'react';

import { FrameLayout } from '@/components/Frame/Layout.js';
import type { Post } from '@/providers/types/SocialMedia.js';
import { getPostFrame } from '@/services/getPostLinks.js';
import { type Frame } from '@/types/frame.js';

interface FrameLayoutWithPostProps {
    post: Post;
    onData?: (frame: Frame) => void;
    children?: ReactNode;
}

export const FrameLayoutWithPost = memo<FrameLayoutWithPostProps>(function Frame({ post, onData, children }) {
    const url = post.metadata.content?.oembedUrl;
    const {
        data: frame,
        isLoading,
        error,
    } = useQuery({
        queryKey: ['frame', url],
        queryFn: () => getPostFrame(url!),
        refetchOnMount: false,
        refetchOnWindowFocus: false,
        retry: false,
        enabled: !!url,
    });

    useEffect(() => {
        if (frame) onData?.(frame);
    }, [frame, onData]);

    if (isLoading) return null;
    if (error || !frame) return children;

    return (
        <FrameLayout post={post} frame={frame}>
            {children}
        </FrameLayout>
    );
});
