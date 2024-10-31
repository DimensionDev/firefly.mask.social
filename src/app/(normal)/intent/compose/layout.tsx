import { type PropsWithChildren } from 'react';

import { SourceTabs } from '@/components/SourceTabs/index.js';
import { DiscoverType } from '@/constants/enum.js';
import { DEFAULT_SOCIAL_SOURCE, DISCOVER_SOURCES } from '@/constants/index.js';
import { resolveDiscoverUrl } from '@/helpers/resolveDiscoverUrl.js';

export default function Layout({ children }: PropsWithChildren) {
    return (
        <>
            <SourceTabs
                source={DEFAULT_SOCIAL_SOURCE}
                sources={DISCOVER_SOURCES}
                href={(x) => resolveDiscoverUrl(x, DiscoverType.Trending)}
            />
            {children}
        </>
    );
}
