import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation.js';
import { memo, useEffect, useMemo } from 'react';

import { ChannelCard } from '@/components/Channel/ChannelCard.js';
import { ClickableArea } from '@/components/ClickableArea.js';
import type { MarkupLinkProps } from '@/components/Markup/MarkupLink/index.js';
import { TippyContext, useTippyContext } from '@/components/TippyContext/index.js';
import { Tippy } from '@/esm/Tippy.js';
import { getFarcasterChannelUrlById } from '@/helpers/getFarcasterChannelUrlById.js';
import { resolveSocialMediaProvider } from '@/helpers/resolveSocialMediaProvider.js';
import { useEverSeen } from '@/hooks/useEverSeen.js';
import { useIsMedium } from '@/hooks/useMediaQuery.js';
import { useChannelStoreState } from '@/store/useChannelStore.js';

export const ChannelTag = memo<Omit<MarkupLinkProps, 'post'>>(function ChannelTag({ title, source }) {
    const isMedium = useIsMedium();
    const router = useRouter();
    const channelId = title?.trim().slice(1);

    const { allChannelData, addChannel } = useChannelStoreState();
    const [viewed, ref] = useEverSeen();

    useEffect(() => {
        if (!title) return;
        router.prefetch(getFarcasterChannelUrlById(title.trim().slice(1)));
    }, [title, router]);

    const data = useQuery({
        enabled: !!channelId && !!source && viewed,
        queryKey: ['channel', 'tag', source, channelId],
        queryFn: async () => {
            if (!channelId || !source) return;
            try {
                const provider = resolveSocialMediaProvider(source);
                const result = await provider.getChannelById(channelId);
                addChannel(source, channelId, result ? result : null);

                return result;
            } catch {
                addChannel(source, channelId, null);
                return;
            }
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

    const insideTippy = useTippyContext();

    if (!channelId || !source) return;

    if (allChannelData[source][channelId] === null) return title;

    if (!isMedium || insideTippy) return content;

    return (
        <TippyContext.Provider value>
            <Tippy
                appendTo={() => document.body}
                maxWidth={350}
                className="tippy-card"
                placement="bottom"
                duration={500}
                delay={500}
                arrow={false}
                trigger="mouseenter"
                hideOnClick
                interactive
                content={<ChannelCard loading={data.isLoading} channel={data.data} />}
            >
                <span ref={ref}>{content}</span>
            </Tippy>
        </TippyContext.Provider>
    );
});
