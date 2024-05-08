'use client';

import { Suspense } from 'react';

import { ChannelList } from '@/components/Channel/ChannelList.js';
import { Loading } from '@/components/Loading.js';
import { type SocialSourceInURL,SourceInURL } from '@/constants/enum.js';
import { resolveSocialSource } from '@/helpers/resolveSource.js';

interface PageProps {
    searchParams: {
        source: SocialSourceInURL;
    };
}

export function TrendingChannelPage({ searchParams: { source = SourceInURL.Farcaster } }: PageProps) {
    const currentSource = resolveSocialSource(source);

    return (
        <div>
            <p className="m-4 ml-4 text-lg font-bold leading-snug text-main">Trending Channels</p>
            <Suspense fallback={<Loading />}>
                <ChannelList source={currentSource} />
            </Suspense>
        </div>
    );
}
