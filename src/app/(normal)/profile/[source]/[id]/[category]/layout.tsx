'use client';

import { notFound } from 'next/navigation.js';
import { type PropsWithChildren } from 'react';

import { ProfilePageLayout } from '@/app/(normal)/profile/[source]/[id]/pages/ProfilePageLayout.js';
import { type ProfileCategory, SourceInURL } from '@/constants/enum.js';
import { isFollowCategory } from '@/helpers/isFollowCategory.js';
import { resolveSourceFromUrlNoFallback } from '@/helpers/resolveSource.js';

export default function Layout({
    children,
    params,
}: PropsWithChildren<{
    params: {
        id: string;
        category: ProfileCategory;
        source: SourceInURL;
    };
}>) {
    const id = params.id;
    const source = resolveSourceFromUrlNoFallback(params.source);

    if (!source || isFollowCategory(params.category)) return notFound();
    const identity = { source, id };

    return (
        <ProfilePageLayout identity={identity} category={params.category}>
            {children}
        </ProfilePageLayout>
    );
}
