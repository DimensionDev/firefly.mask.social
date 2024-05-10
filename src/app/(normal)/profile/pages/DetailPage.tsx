'use client';

import { useQuery } from '@tanstack/react-query';
import { notFound } from 'next/navigation.js';

import { ProfilePage } from '@/app/(normal)/pages/Profile.js';
import { Loading } from '@/components/Loading.js';
import { SourceInURL } from '@/constants/enum.js';
import { resolveSource } from '@/helpers/resolveSource.js';
import { ProfileContext } from '@/hooks/useProfileContext.js';
import { FireflySocialMediaProvider } from '@/providers/firefly/SocialMedia.js';

interface PageProps {
    params: {
        id: string;
    };
    searchParams: {
        source: SourceInURL;
    };
}

export function ProfileDetailPage({ params: { id: identity }, searchParams: { source } }: PageProps) {
    const currentSource = resolveSource(source);

    const { data: profiles = [], isLoading } = useQuery({
        queryKey: ['all-profiles', currentSource, identity],
        queryFn: async () => {
            return FireflySocialMediaProvider.getAllPlatformProfileByIdentity(identity, currentSource);
        },
    });

    if (isLoading) {
        return <Loading />;
    }

    return (
        <ProfileContext.Provider initialState={{ source: currentSource, identity }}>
            <ProfilePage profiles={profiles} />
        </ProfileContext.Provider>
    );
}
