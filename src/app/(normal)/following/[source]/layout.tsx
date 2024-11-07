import { t } from '@lingui/macro';
import { notFound } from 'next/navigation.js';
import { type PropsWithChildren } from 'react';

import { SourceTabs } from '@/components/SourceTabs/index.js';
import { SourceTab } from '@/components/SourceTabs/SourceTab.js';
import type { FollowingSource } from '@/constants/enum.js';
import { FOLLOWING_SOURCES } from '@/constants/index.js';
import { createPageTitleSSR } from '@/helpers/createPageTitle.js';
import { createSiteMetadata } from '@/helpers/createSiteMetadata.js';
import { resolveFollowingUrl } from '@/helpers/resolveFollowingUrl.js';
import { resolveSourceFromUrlNoFallback } from '@/helpers/resolveSource.js';
import { resolveSourceName } from '@/helpers/resolveSourceName.js';

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
    if (!source || !FOLLOWING_SOURCES.includes(source as FollowingSource)) notFound();
    return (
        <>
            <SourceTabs>
                {FOLLOWING_SOURCES.map((x) => (
                    <SourceTab key={x} href={resolveFollowingUrl(x)} isActive={x === source}>
                        {resolveSourceName(x)}
                    </SourceTab>
                ))}
            </SourceTabs>
            {children}
        </>
    );
}
