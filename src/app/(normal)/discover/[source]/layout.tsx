import { notFound, redirect } from 'next/navigation.js';
import { type PropsWithChildren } from 'react';

import { SourceTabs } from '@/components/SourceTabs/index.js';
import { SourceTab } from '@/components/SourceTabs/SourceTab.js';
import { DiscoverType } from '@/constants/enum.js';
import { DISCOVER_SOURCES } from '@/constants/index.js';
import { getUrlFromHeaders } from '@/helpers/getUrlFromHeaders.js';
import { isDiscoverSource, isSocialDiscoverSource } from '@/helpers/isDiscoverSource.js';
import { resolveDiscoverUrl } from '@/helpers/resolveDiscoverUrl.js';
import { resolveSourceFromUrlNoFallback } from '@/helpers/resolveSource.js';
import { resolveSourceName } from '@/helpers/resolveSourceName.js';

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

    return (
        <>
            <SourceTabs>
                {DISCOVER_SOURCES.map((x) => (
                    <SourceTab key={x} href={resolveDiscoverUrl(x, DiscoverType.Trending)} isActive={x === source}>
                        {resolveSourceName(x)}
                    </SourceTab>
                ))}
            </SourceTabs>
            {children}
        </>
    );
}
