'use client';

import { Suspense } from 'react';

import { ChannelContentList } from '@/components/Channel/ChannelContentList.js';
import { Loading } from '@/components/Loading.js';
import { ChannelTabType } from '@/constants/enum.js';
import { ChannelPageContext } from '@/hooks/useChannelPageContext.js';

export function ChannelContentListPage({ type }: { type: ChannelTabType }) {
    const { channel } = ChannelPageContext.useContainer();
    if (!channel) return null;
    return (
        <Suspense fallback={<Loading />}>
            <ChannelContentList type={type} channel={channel} />
        </Suspense>
    );
}
