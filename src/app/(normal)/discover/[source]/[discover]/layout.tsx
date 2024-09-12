import { notFound } from 'next/navigation.js';
import { type PropsWithChildren } from 'react';

import { DiscoverTypeTabs } from '@/app/(normal)/pages/Discover.js';
import { DiscoverType, SourceInURL } from '@/constants/enum.js';
import { DISCOVER_TYPES } from '@/constants/index.js';
import { isSocialDiscoverSource } from '@/helpers/isDiscoverSource.js';
import { resolveSourceFromUrlNoFallback } from '@/helpers/resolveSource.js';

export default function Layout({
    params,
    children,
}: PropsWithChildren<{
    params: {
        discover: DiscoverType;
        source: SourceInURL;
    };
}>) {
    const source = resolveSourceFromUrlNoFallback(params.source);

    if (!source || !isSocialDiscoverSource(source)) {
        return notFound();
    }
    const discoverTypes = DISCOVER_TYPES[source];
    if (!discoverTypes.includes(params.discover)) {
        return notFound();
    }

    return (
        <>
            <DiscoverTypeTabs types={discoverTypes} type={params.discover} source={source} />
            {children}
        </>
    );
}
