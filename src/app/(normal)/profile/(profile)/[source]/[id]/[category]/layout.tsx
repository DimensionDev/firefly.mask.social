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
import { createMetadataProfileById } from '@/helpers/createMetadataProfileById.js';
import { createSiteMetadata } from '@/helpers/createSiteMetadata.js';
import { isFollowCategory } from '@/helpers/isFollowCategory.js';
import { isProfilePageSource } from '@/helpers/isProfilePageSource.js';
import { memoizeWithRedis } from '@/helpers/memoizeWithRedis.js';
import { resolveSourceFromUrl, resolveSourceFromUrlNoFallback } from '@/helpers/resolveSource.js';

interface Props {
    params: Promise<{
        id: string;
        category: ProfileCategory;
        source: SourceInURL;
    }>;
}

const createPageMetadata = memoizeWithRedis(createMetadataProfileById, {
    key: KeyType.CreateMetadataProfileById,
});

export async function generateMetadata(props: Props): Promise<Metadata> {
    const params = await props.params;
    const source = resolveSourceFromUrlNoFallback(params.source);
    if (source && isProfilePageSource(source)) return createPageMetadata(source, params.id);
    return createSiteMetadata();
}

export default async function Layout(
    props: PropsWithChildren<{
        params: Promise<{
            id: string;
            category: SocialProfileCategory | WalletProfileCategory;
            source: SourceInURL;
        }>;
    }>,
) {
    const params = await props.params;
    const { children } = props;

    const id = params.id;
    const source = resolveSourceFromUrl(params.source);
    const identity = { source, id };

    if (!source || isFollowCategory(params.category)) notFound();

    return (
        <>
            <ProfileCategoryTabs category={params.category} source={identity.source as SocialSource} id={identity.id} />
            {children}
        </>
    );
}
