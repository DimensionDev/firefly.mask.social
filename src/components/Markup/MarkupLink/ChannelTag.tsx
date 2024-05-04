import { useRouter } from 'next/navigation.js';
import { memo, useEffect } from 'react';

import { ClickableArea } from '@/components/ClickableArea.js';
import type { MarkupLinkProps } from '@/components/Markup/MarkupLink/index.js';
import { getFarcasterChannelUrlById } from '@/helpers/getFarcasterChannelUrlById.js';

export const ChannelTag = memo<Omit<MarkupLinkProps, 'post'>>(function ChannelTag({ title }) {
    const router = useRouter();

    useEffect(() => {
        if (!title) return;
        router.prefetch(getFarcasterChannelUrlById(title.slice(1)));
    }, [title, router]);

    if (!title) return;

    return (
        <ClickableArea
            className="cursor-pointer text-link hover:underline"
            as="span"
            onClick={() => {
                router.push(getFarcasterChannelUrlById(title.slice(1)));
            }}
        >
            {title}
        </ClickableArea>
    );
});
