import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation.js';
import { memo, useEffect, useMemo, useState } from 'react';
import { useInView } from 'react-cool-inview';

import { ChannelCard } from '@/components/Channel/ChannelCard.js';
import { ClickableArea } from '@/components/ClickableArea.js';
import type { MarkupLinkProps } from '@/components/Markup/MarkupLink/index.js';
import { Tippy } from '@/esm/Tippy.js';
import { getFarcasterChannelUrlById } from '@/helpers/getFarcasterChannelUrlById.js';
import { resolveSocialMediaProvider } from '@/helpers/resolveSocialMediaProvider.js';
import { useIsMedium } from '@/hooks/useMediaQuery.js';
import { useChannelStoreState } from '@/store/useChannelStore.js';

export const ChannelTag = memo<Omit<MarkupLinkProps, 'post'>>(function ChannelTag({ title, source }) {
    const isMedium = useIsMedium();
    const router = useRouter();
    const channelId = title?.trim().slice(1);
    const [viewed, setViewed] = useState(false);

    const { allChannelData, addChannel } = useChannelStoreState();
    const { observe } = useInView({
        rootMargin: '0px 0px',
        onChange: async ({ inView }) => {
            if (inView && !viewed) setViewed(true);
        },
    });

    useEffect(() => {
        if (!title) return;
        router.prefetch(getFarcasterChannelUrlById(title.trim().slice(1)));
    }, [title, router]);

    const data = useQuery({
        enabled: !!channelId && !!source && viewed,
        queryKey: ['channel', 'tag', source, channelId],
        queryFn: async () => {
            if (!channelId || !source) return;
            const cache = allChannelData[source][channelId];
            // If the cache be null, the channel handle does not exist.
            if (cache === null) return;

            // If the cache be undefined, the query is first query.
            if (cache === undefined) {
                const provider = resolveSocialMediaProvider(source);
                const result = await provider.getChannelById(channelId);
                addChannel(source, channelId, result ? result : null);

                return result;
            }

            return cache;
        },
    });

    const content = useMemo(() => {
        if (!channelId) return;
        return (
            <ClickableArea
                className="cursor-pointer text-link hover:underline"
                as="span"
                onClick={() => {
                    router.push(getFarcasterChannelUrlById(channelId));
                }}
            >
                {title}
            </ClickableArea>
        );
    }, [title, channelId, router]);

    if (!channelId) return;

    if (!data.isLoading && !data.data) return title;

    return isMedium ? (
        <Tippy
            appendTo={() => document.body}
            maxWidth={400}
            className="tippy-card"
            placement="bottom"
            duration={200}
            arrow={false}
            trigger="mouseenter"
            hideOnClick
            interactive
            content={<ChannelCard loading={data.isLoading} channel={data.data} />}
        >
            <span>
                <span ref={observe} />
                {content}
            </span>
        </Tippy>
    ) : (
        content
    );
});
