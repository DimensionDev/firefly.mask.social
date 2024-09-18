import { notFound } from 'next/navigation.js';
import type { PropsWithChildren } from 'react';

import { ProfileCategoryTabs } from '@/app/(normal)/profile/pages/ProfileCategoryTabs.js';
import { SocialProfileCategory, type SocialSource, SourceInURL, WalletProfileCategory } from '@/constants/enum.js';
import { isFollowCategory } from '@/helpers/isFollowCategory.js';
import { resolveSourceFromUrl } from '@/helpers/resolveSource.js';

export default function Layout({
    children,
    params,
}: PropsWithChildren<{
    params: {
        id: string;
        category: SocialProfileCategory | WalletProfileCategory;
        source: SourceInURL;
    };
}>) {
    const id = params.id;
    const source = resolveSourceFromUrl(params.source);
    const identity = { source, id };

    if (!source || isFollowCategory(params.category)) return notFound();

    return (
        <>
            <ProfileCategoryTabs category={params.category} source={identity.source as SocialSource} id={identity.id} />
            {children}
        </>
    );
}
