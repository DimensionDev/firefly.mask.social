'use client';

import { useQuery } from '@tanstack/react-query';
import { notFound } from 'next/navigation.js';
import { useMemo, useState } from 'react';

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
    const [value, setValue] = useState({
        source: currentSource,
        identity,
    });

    const context = useMemo(() => {
        return {
            ...value,
            update: setValue,
        };
    }, [value]);

    const { data: profiles, isLoading } = useQuery({
        queryKey: ['all-profiles', currentSource, identity],
        queryFn: async () => {
            return FireflySocialMediaProvider.getAllPlatformProfileByIdentity(identity, currentSource);
        },
    });

    if (isLoading && !profiles) {
        return <Loading />;
    }

    if (!profiles?.length) {
        notFound();
    }

    return (
        <ProfileContext.Provider value={context}>
            <ProfilePage profiles={profiles} />
        </ProfileContext.Provider>
    );
}
