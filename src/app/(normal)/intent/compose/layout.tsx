import { type PropsWithChildren } from 'react';

import { SourceTabs } from '@/components/SourceTabs/index.js';
import { SourceTab } from '@/components/SourceTabs/SourceTab.js';
import { DiscoverType } from '@/constants/enum.js';
import { DEFAULT_SOCIAL_SOURCE, DISCOVER_SOURCES } from '@/constants/index.js';
import { resolveDiscoverUrl } from '@/helpers/resolveDiscoverUrl.js';
import { resolveSourceName } from '@/helpers/resolveSourceName.js';

export default function Layout({ children }: PropsWithChildren) {
    return (
        <>
            <SourceTabs>
                {DISCOVER_SOURCES.map((x) => (
                    <SourceTab
                        key={x}
                        href={resolveDiscoverUrl(x, DiscoverType.Trending)}
                        isActive={x === DEFAULT_SOCIAL_SOURCE}
                    >
                        {resolveSourceName(x)}
                    </SourceTab>
                ))}
            </SourceTabs>
            {children}
        </>
    );
}
