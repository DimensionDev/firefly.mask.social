'use client';

import { type PropsWithChildren } from 'react';

import { FollowPageLayout } from '@/app/(normal)/profile/[source]/[id]/pages/FollowPageLayout.js';
import { ProfilePageLayout } from '@/app/(normal)/profile/[source]/[id]/pages/ProfilePageLayout.js';
import { type ProfileCategory, SourceInURL } from '@/constants/enum.js';
import { isFollowCategory } from '@/helpers/isFollowCategory.js';
import { resolveSourceFromUrl } from '@/helpers/resolveSource.js';
import { ProfilePageContext } from '@/hooks/useProfilePageContext.js';

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
    const source = resolveSourceFromUrl(params.source);
    const identity = { source, id };

    return (
        <ProfilePageContext.Provider initialState={{ category: params.category, identity }}>
            {isFollowCategory(params.category) ? (
                <FollowPageLayout identity={identity} category={params.category}>
                    {children}
                </FollowPageLayout>
            ) : (
                <ProfilePageLayout identity={identity}>{children}</ProfilePageLayout>
            )}
        </ProfilePageContext.Provider>
    );
}
