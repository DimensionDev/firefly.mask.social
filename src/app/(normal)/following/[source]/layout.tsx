import { t } from '@lingui/macro';
import { notFound } from 'next/navigation.js';
import { type PropsWithChildren } from 'react';

import { SourceTabs } from '@/components/SourceTabs/index.js';
import { DISCOVER_SOURCES } from '@/constants/index.js';
import { createPageTitleSSR } from '@/helpers/createPageTitle.js';
import { createSiteMetadata } from '@/helpers/createSiteMetadata.js';
import { isDiscoverSource } from '@/helpers/isDiscoverSource.js';
import { resolveFollowingUrl } from '@/helpers/resolveFollowingUrl.js';
import { resolveSourceFromUrlNoFallback } from '@/helpers/resolveSource.js';

export async function generateMetadata() {
    return createSiteMetadata({
        title: createPageTitleSSR(t`Following`),
    });
}

export default function Layout({
    params,
    children,
}: PropsWithChildren<{
    params: {
        source: string;
    };
}>) {
    const source = resolveSourceFromUrlNoFallback(params.source);
    if (!source || !isDiscoverSource(source)) return notFound();
    return (
        <>
            <SourceTabs source={source} sources={DISCOVER_SOURCES} href={resolveFollowingUrl} />
            {children}
        </>
    );
}
