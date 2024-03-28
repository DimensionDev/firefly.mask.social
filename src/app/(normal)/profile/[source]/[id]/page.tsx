'use client';
import { notFound } from 'next/navigation.js';

import { ProfilePage } from '@/app/(normal)/profile/pages/Profile.js';
import type { SourceInURL } from '@/constants/enum.js';
import { resolveSocialPlatform } from '@/helpers/resolveSocialPlatform.js';
import { getProfileById } from '@/services/getProfileById.js';

interface PageProps {
    params: {
        id: string;
        source: SourceInURL;
    };
}

export default async function Page({ params: { source: _source, id: handleOrProfileId } }: PageProps) {
    const profile = await getProfileById(resolveSocialPlatform(_source), handleOrProfileId);

    if (!profile) {
        notFound();
    }

    return <ProfilePage profile={profile} />;
}
