import type { PropsWithChildren } from 'react';

import { SourceNav } from '@/components/SourceNav.js';
import { type ExploreSourceInURL, ExploreType } from '@/constants/enum.js';
import { EXPLORE_SOURCES } from '@/constants/index.js';
import { resolveExploreUrl } from '@/helpers/resolveExploreUrl.js';
import { resolveExploreSource } from '@/helpers/resolveSourceInUrl.js';
import { resolveExploreSourceName } from '@/helpers/resolveSourceName.js';

export default function Layout({
    params,
    children,
}: PropsWithChildren<{
    params: {
        explore: ExploreType;
        source: ExploreSourceInURL;
    };
}>) {
    const { source, explore } = params;
    const sources = EXPLORE_SOURCES[explore];

    return (
        <>
            {sources ? (
                <SourceNav
                    source={resolveExploreSource(source)}
                    sources={sources}
                    urlResolver={(source) => resolveExploreUrl(explore, source)}
                    nameResolver={(source) => resolveExploreSourceName(source)}
                />
            ) : null}
            {children}
        </>
    );
}
