import { type PropsWithChildren, useMemo } from 'react';

import { SourceTabs } from '@/components/SourceTabs/index.js';
import { DiscoverType } from '@/constants/enum.js';
import { DEFAULT_SOCIAL_SOURCE, DISCOVER_SOURCES } from '@/constants/index.js';
import { createSourceTabs } from '@/helpers/createSourceTabs.js';
import { resolveDiscoverUrl } from '@/helpers/resolveDiscoverUrl.js';

export default function Layout({ children }: PropsWithChildren) {
    const tabs = useMemo(
        () => createSourceTabs(DISCOVER_SOURCES, (x) => resolveDiscoverUrl(x, DiscoverType.Trending)),
        [],
    );
    return (
        <>
            <SourceTabs source={DEFAULT_SOCIAL_SOURCE} tabs={tabs} />
            {children}
        </>
    );
}
