import { safeUnreachable } from '@masknet/kit';
import { useQuery } from '@tanstack/react-query';
import urlcat from 'urlcat';

import Embed from '@/components/Oembed/Embed.js';
import Player from '@/components/Oembed/Player.js';
import { Quote } from '@/components/Posts/Quote.js';
import { fetchJSON } from '@/helpers/fetchJSON.js';
import { formatWarpcastPost } from '@/helpers/formatWarpcastPost.js';
import type { LinkDigest, OpenGraph } from '@/services/digestLink.js';
import type { ResponseJSON } from '@/types/index.js';
import { OpenGraphPayloadSourceType } from '@/types/og.js';

import { Mirror } from './Mirror.js';

interface OembedProps {
    url?: string;
    onData?: (data: OpenGraph) => void;
}

export default function Oembed({ url, onData }: OembedProps) {
    const { isLoading, error, data } = useQuery({
        queryKey: ['oembed', url],
        queryFn: () => {
            if (!url) return;
            return fetchJSON<ResponseJSON<LinkDigest>>(
                urlcat('/api/oembed', {
                    link: encodeURIComponent(url),
                }),
            );
        },
        enabled: !!url,
    });

    if (isLoading || error || !data?.success) return null;

    onData?.(data.data.og);

    const og: OpenGraph = data.data.og;
    if (!og.title) return null;

    const payload = data.data.payload;

    if (payload?.type) {
        const type = payload.type;
        switch (type) {
            case OpenGraphPayloadSourceType.Mirror:
                return (
                    <Mirror
                        address={payload.address}
                        title={og.title}
                        description={og.description || ''}
                        url={og.url}
                        ens={payload.ens}
                        displayName={payload.displayName}
                        timestamp={payload.timestamp}
                    />
                );
            case OpenGraphPayloadSourceType.Farcaster:
                const post = formatWarpcastPost(payload.cast);
                return <Quote post={post} />;
            default:
                safeUnreachable(type);
                break;
        }
    }

    return og.html ? <Player html={og.html} /> : <Embed og={og} />;
}
