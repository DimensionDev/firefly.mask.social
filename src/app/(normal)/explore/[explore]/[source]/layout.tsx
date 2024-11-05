import { notFound } from 'next/navigation.js';
import type { PropsWithChildren } from 'react';

import { ExploreSourceTabs } from '@/components/ExploreSourceTabs.js';
import type { ExploreType, SourceInURL } from '@/constants/enum.js';
import { EXPLORE_SOURCES } from '@/constants/index.js';
import { isExploreSource } from '@/helpers/isSocialSource.js';
import { resolveSourceFromUrlNoFallback } from '@/helpers/resolveSource.js';

export default function Layout({
    params,
    children,
}: PropsWithChildren<{
    params: {
        explore: ExploreType;
        source: SourceInURL;
    };
}>) {
    const source = resolveSourceFromUrlNoFallback(params.source);

    if (!source || !isExploreSource(source)) {
        notFound();
    }

    const exploreSources = EXPLORE_SOURCES[params.explore];

    return (
        <>
            <ExploreSourceTabs type={params.explore} source={source} sources={exploreSources} />
            {children}
        </>
    );
}
