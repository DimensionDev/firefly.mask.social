'use client';
import { useQuery } from '@tanstack/react-query';
import { notFound } from 'next/navigation.js';

import { ProfilePage } from '@/app/(normal)/channel/pages/Channel.js';
import { Loading } from '@/components/Loading.js';
import type { SourceInURL } from '@/constants/enum.js';
import { resolveSocialPlatform } from '@/helpers/resolveSocialPlatform.js';
import { getProfileById } from '@/services/getProfileById.js';

interface PageProps {
    params: {
        id: string;
    };
    searchParams: {
        source: SourceInURL;
    };
}

export function ChannelDetailPage({ params: { id: channelHandle }, searchParams: { source } }: PageProps) {
    const currentSource = resolveSocialPlatform(source);

    const { data: channel = null, isLoading } = useQuery({
        queryKey: ['channel', currentSource, channelHandle],
        queryFn: () => getProfileById(currentSource, channelHandle),
    });

    if (isLoading) {
        return <Loading />;
    }

    if (!channel) {
        notFound();
    }

    return <ProfilePage channel={channel} />;
}
