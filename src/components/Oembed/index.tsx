import Embed from '@/components/Oembed/Embed.js';
import Player from '@/components/Oembed/Player.js';
import type { OpenGraph } from '@/services/digestLink.js';
import { useQuery } from '@tanstack/react-query';

interface OembedProps {
    url?: string;
    onData: (data: OpenGraph) => void;
}

export default function Oembed({ url, onData }: OembedProps) {
    const { isLoading, error, data } = useQuery({
        queryKey: ['oembed', url],
        queryFn: async () => {
            const response = await fetch(`/api/oembed?link=${encodeURIComponent(url as string)}`);
            return response.json();
        },
        enabled: Boolean(url),
    });

    if (isLoading || error || !data) {
        return null;
    } else if (data) {
        onData(data);
    }

    const og: OpenGraph = data.og;

    if (!og.title) {
        return null;
    }

    return og.html ? <Player html={og.html} /> : <Embed og={og} />;
}
