'use client';

import { Suspense } from 'react';

import { ChannelList } from '@/components/Channel/ChannelList.js';
import { Loading } from '@/components/Loading.js';
import { SourceInURL } from '@/constants/enum.js';
import { resolveSocialPlatform } from '@/helpers/resolveSocialPlatform.js';

interface PageProps {
    searchParams: {
        source: SourceInURL;
    };
}

export function TrendingChannelPage({ searchParams: { source = SourceInURL.Farcaster } }: PageProps) {
    const currentSource = resolveSocialPlatform(source);

    return (
        <div>
            <p className="m-4 ml-4 text-lg font-bold leading-snug text-main">Trending Channels</p>
            <Suspense fallback={<Loading />}>
                <ChannelList source={currentSource} />
            </Suspense>
        </div>
    );
}
