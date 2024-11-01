import { type PropsWithChildren, useMemo } from 'react';

import { SourceTabs } from '@/components/SourceTabs/index.js';
import { DiscoverType } from '@/constants/enum.js';
import { DEFAULT_SOCIAL_SOURCE, DISCOVER_SOURCES } from '@/constants/index.js';
import { createTabUrlMap } from '@/helpers/createTabUrlMap.js';
import { resolveDiscoverUrl } from '@/helpers/resolveDiscoverUrl.js';

export default function Layout({ children }: PropsWithChildren) {
    const urlMap = useMemo(
        () => createTabUrlMap(DISCOVER_SOURCES, (x) => resolveDiscoverUrl(x, DiscoverType.Trending)),
        [],
    );
    return (
        <>
            <SourceTabs source={DEFAULT_SOCIAL_SOURCE} sources={DISCOVER_SOURCES} urlMap={urlMap} />
            {children}
        </>
    );
}
