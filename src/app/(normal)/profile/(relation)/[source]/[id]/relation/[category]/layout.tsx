import { notFound } from 'next/navigation.js';
import type { PropsWithChildren } from 'react';

import { FollowPageLayout } from '@/app/(normal)/profile/pages/FollowPageLayout.js';
import { Title } from '@/components/Profile/Title.js';
import { type ProfileCategory, Source, SourceInURL } from '@/constants/enum.js';
import { isFollowCategory } from '@/helpers/isFollowCategory.js';
import { isSocialSource } from '@/helpers/isSocialSource.js';
import { resolveSocialMediaProvider } from '@/helpers/resolveSocialMediaProvider.js';
import { resolveSourceFromUrlNoFallback } from '@/helpers/resolveSource.js';

export default async function Layout({
    children,
    params,
}: PropsWithChildren<{
    params: {
        id: string;
        category: ProfileCategory;
        source: SourceInURL;
    };
}>) {
    if (!isFollowCategory(params.category)) return notFound();
    const id = params.id;
    const source = resolveSourceFromUrlNoFallback(params.source);
    if (!source || !isSocialSource(source) || source === Source.Twitter) return notFound();
    const identity = { source, id };
    const profile = await resolveSocialMediaProvider(source).getProfileById(id);

    if (!profile) return notFound();

    return (
        <>
            <Title profile={profile} sticky keepVisible disableActions className="border-b border-line" />
            <div className="h-12" />
            <FollowPageLayout profile={profile} identity={identity} category={params.category}>
                {children}
            </FollowPageLayout>
        </>
    );
}