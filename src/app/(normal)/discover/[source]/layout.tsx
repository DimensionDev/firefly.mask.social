import { notFound, redirect } from 'next/navigation.js';
import { type PropsWithChildren, useMemo } from 'react';

import { SourceTabs } from '@/components/SourceTabs/index.js';
import { SourceTab } from '@/components/SourceTabs/SourceTab.js';
import { DiscoverType } from '@/constants/enum.js';
import { DISCOVER_SOURCES } from '@/constants/index.js';
import { createSourceTabs } from '@/helpers/createSourceTabs.js';
import { getUrlFromHeaders } from '@/helpers/getUrlFromHeaders.js';
import { isDiscoverSource, isSocialDiscoverSource } from '@/helpers/isDiscoverSource.js';
import { resolveDiscoverUrl } from '@/helpers/resolveDiscoverUrl.js';
import { resolveSourceFromUrlNoFallback } from '@/helpers/resolveSource.js';

export default function Layout({
    params,
    children,
}: PropsWithChildren<{
    params: {
        source: string;
    };
}>) {
    const source = resolveSourceFromUrlNoFallback(params.source);

    if (!source || !isDiscoverSource(source)) {
        notFound();
    }

    if (isSocialDiscoverSource(source) && getUrlFromHeaders()?.pathname === `/${params.source}`) {
        redirect(resolveDiscoverUrl(source, DiscoverType.Trending));
    }

    const tabs = useMemo(
        () => createSourceTabs(DISCOVER_SOURCES, (x) => resolveDiscoverUrl(x, DiscoverType.Trending)),
        [],
    );

    return (
        <>
            <SourceTabs>
                {tabs.map((x) => (
                    <SourceTab key={x.source} href={x.url} isActive={x.source === source}>
                        {x.label}
                    </SourceTab>
                ))}
            </SourceTabs>
            {children}
        </>
    );
}
