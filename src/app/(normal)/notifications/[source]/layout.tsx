import { t } from '@lingui/macro';
import { notFound } from 'next/navigation.js';
import React, { type PropsWithChildren } from 'react';

import { SourceTabs } from '@/components/SourceTabs.js';
import { SOCIAL_DISCOVER_SOURCE } from '@/constants/index.js';
import { createPageTitleSSR } from '@/helpers/createPageTitle.js';
import { createSiteMetadata } from '@/helpers/createSiteMetadata.js';
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
    return (
        <>
            <SourceTabs source={source} sources={SOCIAL_DISCOVER_SOURCE} href={resolveNotificationUrl} />
            {children}
        </>
    );
}
