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

export function ExploreDetailPage({ searchParams: { source = SourceInURL.Farcaster } }: PageProps) {
    const currentSource = resolveSocialPlatform(source);

    return (
        <div>
            <p className="text-lg font-bold leading-snug text-main m-4 ml-4">Trending Channels</p>
            <Suspense fallback={<Loading />}>
                <ChannelList source={currentSource} />
            </Suspense>
        </div>
    );
}
