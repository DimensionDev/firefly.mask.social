import { useQuery } from '@tanstack/react-query';
import urlcat from 'urlcat';

import Embed from '@/components/Oembed/Embed.js';
import Player from '@/components/Oembed/Player.js';
import { fetchJSON } from '@/helpers/fetchJSON.js';
import type { LinkDigest, OpenGraph } from '@/services/digestLink.js';
import type { ResponseJSON } from '@/types/index.js';

interface OembedProps {
    url?: string;
    onData: (data: OpenGraph) => void;
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
        enabled: Boolean(url),
    });

    if (isLoading || error || !data?.success) return null;

    onData(data.data.og);

    const og: OpenGraph = data.data.og;
    if (!og.title) return null;

    return og.html ? <Player html={og.html} /> : <Embed og={og} />;
}
