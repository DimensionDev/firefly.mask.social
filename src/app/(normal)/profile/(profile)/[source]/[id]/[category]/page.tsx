'use client';

import { useQuery } from '@tanstack/react-query';
import { notFound } from 'next/navigation.js';
import { Suspense, useMemo } from 'react';

import { Loading } from '@/components/Loading.js';
import { ProfilePageTimeline } from '@/components/Profile/ProfilePageTimeline.js';
import { type ProfileCategory, Source, SourceInURL } from '@/constants/enum.js';
import { isProfilePageSource } from '@/helpers/isProfilePageSource.js';
import { resolveSourceFromUrl } from '@/helpers/resolveSource.js';
import { getProfileById } from '@/services/getProfileById.js';

interface Props {
    params: {
        id: string;
        category: ProfileCategory;
        source: SourceInURL;
    };
}

export default function Page({ params }: Props) {
    const source = resolveSourceFromUrl(params.source);
    if (!isProfilePageSource(source)) notFound();

    // Lens used handle in profile page, while timeline can only be queried using profileId, it is necessary to convert handle to profileId.
    const { data: profile = null } = useQuery({
        queryKey: ['profile', source, params.id],
        queryFn: async () => {
            if (source === Source.Wallet) return null;
            return getProfileById(source, params.id);
        },
    });

    const identity = useMemo(
        () => ({ id: profile?.profileId ?? params.id, source }),
        [profile?.profileId, params.id, source],
    );

    return (
        <Suspense fallback={<Loading />}>
            <ProfilePageTimeline category={params.category} identity={identity} />
        </Suspense>
    );
}
