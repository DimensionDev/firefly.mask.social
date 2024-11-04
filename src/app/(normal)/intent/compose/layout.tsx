import { type PropsWithChildren, useMemo } from 'react';

import { SourceTabs } from '@/components/SourceTabs/index.js';
import { SourceTab } from '@/components/SourceTabs/SourceTab.js';
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
            <SourceTabs>
                {tabs.map((x) => (
                    <SourceTab key={x.source} href={x.url} isActive={x.source === DEFAULT_SOCIAL_SOURCE}>
                        {x.label}
                    </SourceTab>
                ))}
            </SourceTabs>
            {children}
        </>
    );
}
