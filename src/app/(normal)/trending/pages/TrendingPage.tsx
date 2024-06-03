'use client';

import { Trans } from '@lingui/macro';
import { Suspense } from 'react';

import { ChannelList } from '@/components/Channel/ChannelList.js';
import { Loading } from '@/components/Loading.js';
import { PageTitle } from '@/components/PageTitle.js';
import { type SocialSourceInURL, SourceInURL } from '@/constants/enum.js';
import { resolveSocialSource } from '@/helpers/resolveSource.js';

interface PageProps {
    searchParams: {
        source: SocialSourceInURL;
    };
}

export function TrendingChannelPage({ searchParams: { source = SourceInURL.Farcaster } }: PageProps) {
    const currentSource = resolveSocialSource(source);

    return (
        <div className="flex h-screen flex-col">
            <PageTitle>
                <Trans>Trending Channels</Trans>
            </PageTitle>
            <div className="no-scrollbar flex-1 overflow-auto">
                <Suspense fallback={<Loading />}>
                    <ChannelList source={currentSource} />
                </Suspense>
            </div>
        </div>
    );
}
