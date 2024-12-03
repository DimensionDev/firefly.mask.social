import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation.js';
import { memo, useEffect, useMemo } from 'react';

import { ChannelCard } from '@/components/Channel/ChannelCard.js';
import { ClickableArea } from '@/components/ClickableArea.js';
import { InteractiveTippy } from '@/components/InteractiveTippy.js';
import type { MarkupLinkProps } from '@/components/Markup/MarkupLink/index.js';
import { TippyContext, useTippyContext } from '@/components/TippyContext/index.js';
import { resolveChannelUrl } from '@/helpers/resolveChannelUrl.js';
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
        router.prefetch(resolveChannelUrl(title.trim().slice(1), undefined, source));
    }, [title, router, source]);

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
                className="cursor-pointer text-highlight hover:underline"
                as="span"
                onClick={() => {
                    router.push(resolveChannelUrl(channelId, undefined, source));
                }}
            >
                {title}
            </ClickableArea>
        );
    }, [title, channelId, router, source]);

    const insideTippy = useTippyContext();

    if (!channelId || !source) return;

    if (allChannelData[source][channelId] === null) return title;

    if (!isMedium || insideTippy) return content;

    return (
        <TippyContext.Provider value>
            <InteractiveTippy
                maxWidth={350}
                className="tippy-card"
                placement="bottom"
                content={<ChannelCard loading={data.isLoading} channel={data.data} />}
            >
                <span ref={ref}>{content}</span>
            </InteractiveTippy>
        </TippyContext.Provider>
    );
});
