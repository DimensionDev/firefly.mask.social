'use client';
import { useQuery } from '@tanstack/react-query';
import { notFound } from 'next/navigation.js';

import { ProfilePage } from '@/app/(normal)/pages/Profile.js';
import { Loading } from '@/components/Loading.js';
import type { SocialSourceInURL } from '@/constants/enum.js';
import { resolveSocialSource } from '@/helpers/resolveSource.js';
import { getProfileById } from '@/services/getProfileById.js';

interface PageProps {
    params: {
        id: string;
    };
    searchParams: {
        source: SocialSourceInURL;
    };
}

export function ProfileDetailPage({ params: { id: handleOrProfileId }, searchParams: { source } }: PageProps) {
    const currentSource = resolveSocialSource(source);

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
