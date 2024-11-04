import { t } from '@lingui/macro';
import { notFound } from 'next/navigation.js';
import { type PropsWithChildren, useMemo } from 'react';

import { SourceTabs } from '@/components/SourceTabs/index.js';
import { BOOKMARK_SOURCES } from '@/constants/index.js';
import { createPageTitleSSR } from '@/helpers/createPageTitle.js';
import { createSiteMetadata } from '@/helpers/createSiteMetadata.js';
import { createSourceTabs } from '@/helpers/createSourceTabs.js';
import { isBookmarkSource } from '@/helpers/isBookmarkSource.js';
import { resolveBookmarkUrl } from '@/helpers/resolveBookmarkUrl.js';
import { resolveSourceFromUrlNoFallback } from '@/helpers/resolveSource.js';

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
    const tabs = useMemo(() => createSourceTabs(BOOKMARK_SOURCES, resolveBookmarkUrl), []);
    if (!source || !isBookmarkSource(source)) notFound();
    return (
        <>
            <SourceTabs tabs={tabs} source={source} />
            {children}
        </>
    );
}
