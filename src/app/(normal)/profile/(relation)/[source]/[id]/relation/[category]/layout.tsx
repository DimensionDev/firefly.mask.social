import { notFound } from 'next/navigation.js';
import type { PropsWithChildren } from 'react';

import { FollowPageLayout } from '@/app/(normal)/profile/pages/FollowPageLayout.js';
import { Title } from '@/components/Profile/Title.js';
import { type ProfileCategory, Source, SourceInURL } from '@/constants/enum.js';
import { isFollowCategory } from '@/helpers/isFollowCategory.js';
import { isSocialSource } from '@/helpers/isSocialSource.js';
import { resolveSocialMediaProvider } from '@/helpers/resolveSocialMediaProvider.js';
import { resolveSourceFromUrlNoFallback } from '@/helpers/resolveSource.js';
import { runInSafeAsync } from '@/helpers/runInSafe.js';

export default async function Layout(
    props: PropsWithChildren<{
        params: Promise<{
            id: string;
            category: ProfileCategory;
            source: SourceInURL;
        }>;
    }>,
) {
    const params = await props.params;
    const { children } = props;

    if (!isFollowCategory(params.category)) notFound();
    const id = params.id;
    const source = resolveSourceFromUrlNoFallback(params.source);
    if (!source || !isSocialSource(source) || source === Source.Twitter) notFound();
    const identity = { source, id };
    const profile = await runInSafeAsync(() => resolveSocialMediaProvider(source).getProfileById(id));

    if (!profile) notFound();

    return (
        <>
            <Title
                profile={profile}
                fallbackIdentity={identity}
                sticky
                keepVisible
                disableActions
                className="border-b border-line"
            />
            <div className="h-12" />
            <FollowPageLayout profile={profile} identity={identity} category={params.category}>
                {children}
            </FollowPageLayout>
        </>
    );
}
