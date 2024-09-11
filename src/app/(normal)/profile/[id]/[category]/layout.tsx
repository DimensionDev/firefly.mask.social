import { headers } from 'next/headers.js';
import { type PropsWithChildren } from 'react';

import { FollowPageLayout } from '@/app/(normal)/profile/[id]/pages/FollowPageLayout.js';
import { ProfilePageLayout } from '@/app/(normal)/profile/[id]/pages/ProfilePageLayout.js';
import { type ProfileCategory, SourceInURL } from '@/constants/enum.js';
import { isFollowCategory } from '@/helpers/isFollowCategory.js';
import { narrowToSocialSource } from '@/helpers/narrowToSocialSource.js';
import { parseURL } from '@/helpers/parseURL.js';
import { resolveSourceFromUrl } from '@/helpers/resolveSource.js';

export default function Layout({
    children,
    params,
}: PropsWithChildren<{
    params: {
        id: string;
        category: ProfileCategory;
    };
}>) {
    const id = params.id;
    const sourceInUrl = parseURL(headers().get('x-url') ?? '')?.searchParams?.get('source') as SourceInURL;
    const source = resolveSourceFromUrl(sourceInUrl);

    if (isFollowCategory(params.category)) {
        return (
            <FollowPageLayout id={id} source={narrowToSocialSource(source)}>
                {children}
            </FollowPageLayout>
        );
    }

    return (
        <ProfilePageLayout identity={{ source, id }} category={params.category}>
            {children}
        </ProfilePageLayout>
    );
}
