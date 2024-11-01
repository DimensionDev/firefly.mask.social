import { t } from '@lingui/macro';
import { notFound } from 'next/navigation.js';
import { type PropsWithChildren, useMemo } from 'react';

import { SourceTabs } from '@/components/SourceTabs/index.js';
import { SOCIAL_DISCOVER_SOURCE } from '@/constants/index.js';
import { createPageTitleSSR } from '@/helpers/createPageTitle.js';
import { createSiteMetadata } from '@/helpers/createSiteMetadata.js';
import { createTabUrlMap } from '@/helpers/createTabUrlMap.js';
import { isDiscoverSource } from '@/helpers/isDiscoverSource.js';
import { resolveNotificationUrl } from '@/helpers/resolveNotificationUrl.js';
import { resolveSourceFromUrlNoFallback } from '@/helpers/resolveSource.js';

export async function generateMetadata() {
    return createSiteMetadata({
        title: createPageTitleSSR(t`Notifications`),
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
    if (!source || !isDiscoverSource(source)) notFound();

    const urlMap = useMemo(() => createTabUrlMap(SOCIAL_DISCOVER_SOURCE, resolveNotificationUrl), []);
    return (
        <>
            <SourceTabs source={source} sources={SOCIAL_DISCOVER_SOURCE} urlMap={urlMap} />
            {children}
        </>
    );
}
