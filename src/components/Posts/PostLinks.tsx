import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';

import { ActionContainer } from '@/components/Blink/ActionContainer.js';
import { Blink } from '@/components/Blink/index.js';
import { Frame } from '@/components/Frame/index.js';
import { Oembed } from '@/components/Oembed/index.js';
import { STATUS } from '@/constants/enum.js';
import { env } from '@/constants/env.js';
import { SOLANA_BLINK_PREFIX } from '@/constants/regexp.js';
import { BlinkLoader } from '@/providers/blink/Loader.js';
import type { Post } from '@/providers/types/SocialMedia.js';

export function PostLinks({
    post,
    blink,
    setEndingLinkCollapsed,
}: {
    blink?: string;
    post: Post;
    setEndingLinkCollapsed?: (collapsed: boolean) => void;
}) {
    const oembedUrl = post.metadata.content?.oembedUrl;
    const enabled = !!oembedUrl && !blink && env.external.NEXT_PUBLIC_BLINK === STATUS.Enabled;
    const { data, error } = useQuery({
        queryKey: ['get_post_oembed_url_is_blink', oembedUrl],
        async queryFn() {
            return BlinkLoader.fetchAction(`${SOLANA_BLINK_PREFIX}${oembedUrl!}`);
        },
        enabled,
    });

    useEffect(() => {
        if (data) {
            setEndingLinkCollapsed?.(true);
        }
    }, [data]);

    if (blink && env.external.NEXT_PUBLIC_BLINK === STATUS.Enabled) {
        return <Blink url={blink} onData={() => setEndingLinkCollapsed?.(true)} />;
    }

    if (data) {
        return <ActionContainer action={data} />;
    }

    if (post.metadata.content?.oembedUrls?.length && env.external.NEXT_PUBLIC_FRAME === STATUS.Enabled) {
        return (
            <Frame urls={post.metadata.content.oembedUrls} postId={post.postId} source={post.source}>
                {post.metadata.content.oembedUrl && !post.quoteOn ? (
                    <Oembed url={post.metadata.content.oembedUrl} onData={() => setEndingLinkCollapsed?.(true)} />
                ) : null}
            </Frame>
        );
    }

    if ((error || !enabled) && post.metadata.content?.oembedUrl && !post.quoteOn) {
        return <Oembed url={post.metadata.content.oembedUrl} onData={() => setEndingLinkCollapsed?.(true)} />;
    }

    return null;
}
