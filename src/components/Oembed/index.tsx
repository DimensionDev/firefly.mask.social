import { safeUnreachable } from '@masknet/kit';
import { useQuery } from '@tanstack/react-query';
import { memo, Suspense, useEffect } from 'react';

import { Embed } from '@/components/Oembed/Embed.js';
import { Player } from '@/components/Oembed/Player.js';
import { PostEmbed } from '@/components/Oembed/Post.js';
import { Quote } from '@/components/Posts/Quote.js';
import { formatWarpcastPost } from '@/helpers/formatWarpcastPost.js';
import { isLinkMatchingHost } from '@/helpers/isLinkMatchingHost.js';
import type { Post } from '@/providers/types/SocialMedia.js';
import { getPostOembed } from '@/services/getPostLinks.js';
import { type LinkDigested, type OpenGraph, PayloadType } from '@/types/og.js';

interface OembedUIProps {
    og: OpenGraph;
}

const OembedUI = memo<OembedUIProps>(function OembedUI({ og }) {
    return og.html ? (
        <Player html={og.html} isSpotify={isLinkMatchingHost(og.url, 'open.spotify.com', false)} />
    ) : (
        <Embed og={og} />
    );
});

export const OembedLayout = memo<{ data: LinkDigested; post?: Post }>(function OembedPayload(props) {
    const {
        data: { payload, og },
        post,
    } = props;

    if (!og.title) return null;
    if (payload?.type === 'Post' && post?.type === 'Mirror' && post.parentPostId === payload.id) return null;
    if (payload?.type === 'Post' && payload.id === post?.postId) return null;

    const type = payload?.type;
    if (!type) return <OembedUI og={og} />;

    switch (type) {
        case PayloadType.Farcaster:
            return <Quote post={formatWarpcastPost(payload.cast)} />;
        case PayloadType.Post:
            return (
                <Suspense fallback={null}>
                    <PostEmbed id={payload.id} source={payload.source} />
                </Suspense>
            );
        case PayloadType.Mirror:
            // Since it has been processed in PostLinks
            return;
        default:
            safeUnreachable(type);
            return <OembedUI og={og} />;
    }
});

interface OembedProps {
    post: Post;
    onData?: (data: OpenGraph) => void;
}

export const Oembed = memo<OembedProps>(function Oembed({ post, onData }) {
    const url = post.metadata.content?.oembedUrl;
    const {
        data: oembed,
        isLoading,
        error,
    } = useQuery({
        queryKey: ['oembed', url, post],
        queryFn: () => getPostOembed(url!, post),
        refetchOnMount: false,
        refetchOnWindowFocus: false,
        retry: false,
        enabled: !!url,
    });

    useEffect(() => {
        if (oembed?.og) onData?.(oembed.og);
    }, [oembed, onData]);

    if (isLoading || error || !oembed?.og) return null;

    return <OembedLayout data={oembed} />;
});
