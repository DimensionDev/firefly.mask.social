'use client';

import { t } from '@lingui/macro';
import { useQuery } from '@tanstack/react-query';
import { notFound } from 'next/navigation.js';
import { Suspense, useMemo } from 'react';
import { useDocumentTitle } from 'usehooks-ts';

import { ChannelTabs } from '@/components/Channel/ChannelTabs.js';
import { Info } from '@/components/Channel/Info.js';
import { PostList } from '@/components/Channel/PostList.js';
import { Title } from '@/components/Channel/Title.js';
import { Loading } from '@/components/Loading.js';
import { type SocialSourceInURL, STATUS } from '@/constants/enum.js';
import { env } from '@/constants/env.js';
import { SITE_NAME } from '@/constants/index.js';
import { createPageTitle } from '@/helpers/createPageTitle.js';
import { resolveSocialMediaProvider } from '@/helpers/resolveSocialMediaProvider.js';
import { resolveSocialSource } from '@/helpers/resolveSource.js';
import { useUpdateCurrentVisitingChannel } from '@/hooks/useCurrentVisitingChannel.js';
import { useNavigatorTitle } from '@/hooks/useNavigatorTitle.js';

interface PageProps {
    params: {
        id: string;
    };
    searchParams: {
        source: SocialSourceInURL;
    };
}

export function ChannelDetailPage({ params: { id: channelId }, searchParams: { source } }: PageProps) {
    const currentSource = resolveSocialSource(source);

    const { data: channel = null, isLoading } = useQuery({
        queryKey: ['channel', currentSource, channelId],
        queryFn: () => {
            const provider = resolveSocialMediaProvider(currentSource);
            return provider.getChannelById(channelId);
        },
    });

    const title = useMemo(() => {
        if (!channel) return SITE_NAME;
        const fragments = [channel.name];
        if (channel.id) fragments.push(`(/${channel.id})`);
        return createPageTitle(fragments.join(' '));
    }, [channel]);

    useDocumentTitle(title);
    useNavigatorTitle(t`Channel`);
    useUpdateCurrentVisitingChannel(channel);

    if (isLoading) {
        return <Loading />;
    }

    if (!channel) {
        notFound();
    }

    return (
        <div>
            <Title channel={channel} />

            <Info channel={channel} source={channel.source} isChannelPage />

            <hr className="divider w-full border-line" />

            {env.external.NEXT_PUBLIC_CHANNEL_TRENDING === STATUS.Enabled ? (
                <ChannelTabs channel={channel} />
            ) : (
                <Suspense fallback={<Loading />}>
                    <PostList source={channel.source} channel={channel} />
                </Suspense>
            )}
        </div>
    );
}
