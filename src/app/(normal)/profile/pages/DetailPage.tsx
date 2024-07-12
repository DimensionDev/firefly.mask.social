'use client';

import { notFound } from 'next/navigation.js';

import { ProfilePage } from '@/app/(normal)/pages/Profile.js';
import { type SourceInURL } from '@/constants/enum.js';
import { resolveSourceFromUrl } from '@/helpers/resolveSource.js';
import { ProfileTabContext } from '@/hooks/useProfileTabContext.js';

interface Props {
    identity: string;
    source: SourceInURL;
}

export function ProfileDetailPage({ identity, source }: Props) {
    if (!identity) {
        notFound();
    }

    return (
        <ProfileTabContext.Provider initialState={{ source: resolveSourceFromUrl(source), identity }}>
            <ProfilePage />
        </ProfileTabContext.Provider>
    );
}
