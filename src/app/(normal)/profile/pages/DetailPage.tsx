'use client';
import { useQuery } from '@tanstack/react-query';
import { notFound } from 'next/navigation.js';

import { ProfilePage } from '@/app/(normal)/pages/Profile.js';
import { Loading } from '@/components/Loading.js';
import type { SourceInURL } from '@/constants/enum.js';
import { resolveSource } from '@/helpers/resolveSource.js';
import { getProfileById } from '@/services/getProfileById.js';

interface PageProps {
    params: {
        id: string;
    };
    searchParams: {
        source: SourceInURL;
    };
}

export function ProfileDetailPage({ params: { id: handleOrProfileId }, searchParams: { source } }: PageProps) {
    const currentSource = resolveSource(source);

    const { data: profile = null, isLoading } = useQuery({
        queryKey: ['profile', currentSource, handleOrProfileId],
        queryFn: () => getProfileById(currentSource, handleOrProfileId),
    });

    if (isLoading) {
        return <Loading />;
    }

    if (!profile) {
        notFound();
    }

    return <ProfilePage profile={profile} />;
}
