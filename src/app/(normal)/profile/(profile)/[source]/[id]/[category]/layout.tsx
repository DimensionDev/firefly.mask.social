import type { Metadata } from 'next';
import { notFound } from 'next/navigation.js';
import type { PropsWithChildren } from 'react';

import { ProfileCategoryTabs } from '@/app/(normal)/profile/pages/ProfileCategoryTabs.js';
import {
    KeyType,
    type ProfileCategory,
    SocialProfileCategory,
    type SocialSource,
    SourceInURL,
    WalletProfileCategory,
} from '@/constants/enum.js';
import { createProfilePageMetadataById } from '@/helpers/createPageMetadata.js';
import { createSiteMetadata } from '@/helpers/createSiteMetadata.js';
import { isFollowCategory } from '@/helpers/isFollowCategory.js';
import { isProfilePageSource } from '@/helpers/isProfilePageSource.js';
import { memoizeWithRedis } from '@/helpers/memoizeWithRedis.js';
import { resolveSourceFromUrl, resolveSourceFromUrlNoFallback } from '@/helpers/resolveSource.js';

interface Props {
    params: {
        id: string;
        category: ProfileCategory;
        source: SourceInURL;
    };
}

const createPageMetadata = memoizeWithRedis(createProfilePageMetadataById, {
    key: KeyType.CreateProfilePageMetadataById,
});

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const source = resolveSourceFromUrlNoFallback(params.source);
    if (source && isProfilePageSource(source)) return createPageMetadata(source, params.id);
    return createSiteMetadata();
}

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
