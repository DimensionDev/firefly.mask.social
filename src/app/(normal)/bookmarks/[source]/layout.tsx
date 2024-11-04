import { t } from '@lingui/macro';
import { notFound } from 'next/navigation.js';
import { type PropsWithChildren } from 'react';

import { SourceTabs } from '@/components/SourceTabs/index.js';
import { SourceTab } from '@/components/SourceTabs/SourceTab.js';
import { BOOKMARK_SOURCES } from '@/constants/index.js';
import { createPageTitleSSR } from '@/helpers/createPageTitle.js';
import { createSiteMetadata } from '@/helpers/createSiteMetadata.js';
import { isBookmarkSource } from '@/helpers/isBookmarkSource.js';
import { resolveBookmarkUrl } from '@/helpers/resolveBookmarkUrl.js';
import { resolveSourceFromUrlNoFallback } from '@/helpers/resolveSource.js';
import { resolveSourceName } from '@/helpers/resolveSourceName.js';

export async function generateMetadata() {
    return createSiteMetadata({
        title: createPageTitleSSR(t`Bookmarks`),
    });
}

export default function Layout({
    children,
    params,
}: PropsWithChildren<{
    params: {
        source: string;
    };
}>) {
    const source = resolveSourceFromUrlNoFallback(params.source);
    if (!source || !isBookmarkSource(source)) notFound();
    return (
        <>
            <SourceTabs>
                {BOOKMARK_SOURCES.map((x) => (
                    <SourceTab key={x} href={resolveBookmarkUrl(x)} isActive={x === source}>
                        {resolveSourceName(x)}
                    </SourceTab>
                ))}
            </SourceTabs>
            {children}
        </>
    );
}
