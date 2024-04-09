'use client';
import { useQuery } from '@tanstack/react-query';
import { notFound, useSearchParams } from 'next/navigation.js';

import { ProfilePage } from '@/app/(normal)/profile/pages/Profile.js';
import { Loading } from '@/components/Loading.js';
import type { SourceInURL } from '@/constants/enum.js';
import { resolveSocialPlatform } from '@/helpers/resolveSocialPlatform.js';
import { getProfileById } from '@/services/getProfileById.js';

interface PageProps {
    params: {
        id: string;
    };
}

export default function Page({ params: { id: handleOrProfileId } }: PageProps) {
    const searchParams = useSearchParams();
    const source = searchParams.get('source') as SourceInURL;
    const currentSource = resolveSocialPlatform(source);

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
