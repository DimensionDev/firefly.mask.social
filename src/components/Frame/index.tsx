import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import urlcat from 'urlcat';

import { Image } from '@/esm/Image.js';
import { fetchJSON } from '@/helpers/fetchJSON.js';
import type { Frame, LinkDigest } from '@/services/digestFrameLink.js';
import type { ResponseJSON } from '@/types/index.js';

interface FrameProps {
    url: string;
    onData?: (frame: Frame) => void;
    children?: React.ReactNode;
}

export function Frame({ url, onData, children }: FrameProps) {
    const { isLoading, error, data } = useQuery({
        queryKey: ['frame', url],
        queryFn: () => {
            if (!url) return;
            return fetchJSON<ResponseJSON<LinkDigest>>(
                urlcat('/api/frame', {
                    link: url,
                }),
            );
        },
        enabled: !!url,
        refetchOnMount: false,
        refetchOnWindowFocus: false,
        retry: false,
    });

    useEffect(() => {
        if (!data?.success || !data?.data?.frame) return;
        onData?.(data.data.frame);
    }, [data, onData]);

    if (isLoading || error || !data?.success) return children;

    const frame: Frame = data.data.frame;

    return (
        <div className="mt-4 text-sm">
            <div>
                <Image
                    className="divider aspect-2 w-full rounded-t-xl object-cover"
                    unoptimized
                    priority={false}
                    src={frame.image.url}
                    alt={frame.title}
                    width={frame.image.width}
                    height={frame.image.height}
                />
            </div>
            {frame.buttons ? (
                <div>
                    {frame.buttons?.map((button) => {
                        return <button key={button.index}>{button.text}</button>;
                    })}
                </div>
            ) : null}
        </div>
    );
}
