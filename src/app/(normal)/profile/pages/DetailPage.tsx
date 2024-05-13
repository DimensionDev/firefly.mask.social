'use client';

import { EMPTY_LIST } from '@masknet/shared-base';
import { useQuery } from '@tanstack/react-query';
import { notFound, usePathname, useSearchParams } from 'next/navigation.js';

import { ProfilePage } from '@/app/(normal)/pages/Profile.js';
import { Loading } from '@/components/Loading.js';
import { Source, SourceInURL } from '@/constants/enum.js';
import { resolveSource } from '@/helpers/resolveSource.js';
import { ProfileContext } from '@/hooks/useProfileContext.js';
import { FireflySocialMediaProvider } from '@/providers/firefly/SocialMedia.js';

export function ProfileDetailPage() {
    /**
     * Because the use of history.replaceState, it causes incorrect returns of identity and source in nextjs props between route jumps.
     * Therefore, we obtain the correct values through pathname and searchParams.
     */
    const searchParams = useSearchParams();
    const source = searchParams.get('source') as SourceInURL;
    const currentSource = resolveSource(source ?? Source.Farcaster);
    const pathname = usePathname();
    const identity = source ? pathname.replace('/profile/', '') : '';

    const { data: profiles = [], isLoading } = useQuery({
        queryKey: ['all-profiles', currentSource, identity],
        queryFn: async () => {
            if (!identity) return EMPTY_LIST;
            return FireflySocialMediaProvider.getAllPlatformProfileByIdentity(identity, currentSource);
        },
    });

    if (isLoading) {
        return <Loading />;
    }

    if (!identity) {
        notFound();
    }

    return (
        <ProfileContext.Provider initialState={{ source: currentSource, identity }}>
            <ProfilePage profiles={profiles} />
        </ProfileContext.Provider>
    );
}
