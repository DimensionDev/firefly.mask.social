import { safeUnreachable } from '@masknet/kit';
import { useQuery } from '@tanstack/react-query';
import { memo, Suspense, useEffect } from 'react';
import urlcat from 'urlcat';

import { Embed } from '@/components/Oembed/Embed.js';
import { Mirror } from '@/components/Oembed/Mirror.js';
import { Player } from '@/components/Oembed/Player.js';
import { PostEmbed } from '@/components/Oembed/Post.js';
import { Quote } from '@/components/Posts/Quote.js';
import { fetchJSON } from '@/helpers/fetchJSON.js';
import { formatWarpcastPost } from '@/helpers/formatWarpcastPost.js';
import { isLinkMatchingHost } from '@/helpers/isLinkMatchingHost.js';
import { isValidDomain } from '@/helpers/isValidDomain.js';
import { resolveTCOLink } from '@/helpers/resolveTCOLink.js';
import type { ResponseJSON } from '@/types/index.js';
import { type LinkDigested, type OpenGraph, PayloadType } from '@/types/og.js';

interface OembedUIProps {
    og: OpenGraph;
}

export const OembedUI = memo<OembedUIProps>(function OembedUI({ og }) {
    return og.html ? (
        <Player html={og.html} isSpotify={isLinkMatchingHost(og.url, 'open.spotify.com', false)} />
    ) : (
        <Embed og={og} />
    );
});

interface OembedProps {
    url?: string;
    onData?: (data: OpenGraph) => void;
}

export const Oembed = memo<OembedProps>(function Oembed({ url, onData }) {
    const { isLoading, error, data } = useQuery({
        queryKey: ['oembed', url],
        queryFn: async () => {
            if (isValidDomain(url)) return;
            return fetchJSON<ResponseJSON<LinkDigested>>(
                urlcat('/api/oembed', {
                    link: (await resolveTCOLink(url)) ?? url,
                }),
            );
        },
        enabled: !!url,
        refetchOnMount: false,
        refetchOnWindowFocus: false,
        retry: false,
    });

    useEffect(() => {
        if (!data?.success || !data?.data?.og) return;
        onData?.(data.data.og);
    }, [data, onData]);

    if (isLoading || error || !data?.success) return null;

    const og: OpenGraph = data.data.og;
    if (!og.title) return null;

    const payload = data.data.payload;

    const type = payload?.type;
    if (type) {
        switch (type) {
            case PayloadType.Mirror:
                return (
                    <Mirror
                        address={payload.address}
                        title={og.title}
                        description={payload.body || ''}
                        url={og.url}
                        ens={payload.ens}
                        displayName={payload.displayName}
                        timestamp={payload.timestamp}
                    />
                );
            case PayloadType.Farcaster:
                const post = formatWarpcastPost(payload.cast);
                return <Quote post={post} />;
            case PayloadType.Post:
                const id = payload.id;
                return (
                    <Suspense fallback={null}>
                        <PostEmbed id={id} source={payload.source} />
                    </Suspense>
                );
            default:
                safeUnreachable(type);
                break;
        }
    }

    return <OembedUI og={og} />;
});
