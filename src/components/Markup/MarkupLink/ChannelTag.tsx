import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation.js';
import { memo, useEffect, useMemo, useState } from 'react';
import { useInView } from 'react-cool-inview';

import { ChannelCard } from '@/components/Channel/ChannelCard.js';
import { ClickableArea } from '@/components/ClickableArea.js';
import type { MarkupLinkProps } from '@/components/Markup/MarkupLink/index.js';
import { Tippy } from '@/esm/Tippy.js';
import { classNames } from '@/helpers/classNames.js';
import { getFarcasterChannelUrlById } from '@/helpers/getFarcasterChannelUrlById.js';
import { isNumberic } from '@/helpers/isNumberic.js';
import { resolveSocialMediaProvider } from '@/helpers/resolveSocialMediaProvider.js';
import { useIsMedium } from '@/hooks/useMediaQuery.js';

export const ChannelTag = memo<Omit<MarkupLinkProps, 'post'>>(function ChannelTag({ title, source }) {
    const isMedium = useIsMedium();
    const router = useRouter();
    const channelId = title?.trim().slice(1);
    const [viewed, setViewed] = useState(false);

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
        queryKey: ['channel', source, channelId],
        queryFn: async () => {
            if (!channelId || !source) return;
            const provider = resolveSocialMediaProvider(source);
            return provider.getChannelById(channelId);
        },
    });

    const content = useMemo(() => {
        if (!channelId) return;

        return (
            <ClickableArea
                className={classNames('cursor-pointer', {
                    'text-link hover:underline': isNumberic(channelId) ? !!data.data : true,
                })}
                as="span"
                onClick={() => {
                    /**
                     * For channels where the channelId is purely numerical,
                     * it needs to be determined whether the data that can be
                     * requested confirms whether this channel exists. */
                    if (isNumberic(channelId) && !data.data) return;
                    router.push(getFarcasterChannelUrlById(channelId));
                }}
            >
                {title}
            </ClickableArea>
        );
    }, [title, channelId, router, data.data]);

    if (!channelId) return;

    return isMedium ? (
        <Tippy
            disabled={isNumberic(channelId) && !data.data}
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
