import { notFound } from 'next/navigation.js';
import type { PropsWithChildren } from 'react';

import { EngagementLayout } from '@/app/(normal)/post/[source]/[id]/pages/EngagementLayout.js';
import type { EngagementType } from '@/constants/enum.js';
import { isSocialSource } from '@/helpers/isSocialSource.js';
import { resolveSourceFromUrlNoFallback } from '@/helpers/resolveSource.js';

export default async function Layout(
    props: PropsWithChildren<{
        params: Promise<{
            source: string;
            id: string;
            type: EngagementType;
        }>;
    }>,
) {
    const params = await props.params;
    const { children } = props;

    const source = resolveSourceFromUrlNoFallback(params.source);
    if (!source || !isSocialSource(source)) notFound();
    return (
        <EngagementLayout source={source} id={params.id} type={params.type}>
            {children}
        </EngagementLayout>
    );
}
