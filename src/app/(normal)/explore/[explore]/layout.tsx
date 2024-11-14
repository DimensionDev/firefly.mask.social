import { t, Trans } from '@lingui/macro';
import type { PropsWithChildren } from 'react';

import { SourceTabs } from '@/components/SourceTabs/index.js';
import { SourceTab } from '@/components/SourceTabs/SourceTab.js';
import { ExploreType, Source, TrendingType } from '@/constants/enum.js';
import { EXPLORE_TYPES } from '@/constants/index.js';
import { createPageTitleSSR } from '@/helpers/createPageTitle.js';
import { createSiteMetadata } from '@/helpers/createSiteMetadata.js';
import { resolveExploreUrl } from '@/helpers/resolveExploreUrl.js';
import { setupLocaleForSSR } from '@/i18n/index.js';

export async function generateMetadata() {
    return createSiteMetadata({
        title: createPageTitleSSR(t`Explore`),
    });
}

export default function Layout({
    params,
    children,
}: PropsWithChildren<{
    params: {
        explore: ExploreType;
    };
}>) {
    setupLocaleForSSR();

    const labels: Record<ExploreType, React.ReactNode> = {
        [ExploreType.TopProfiles]: <Trans>Top Profiles</Trans>,
        [ExploreType.CryptoTrends]: <Trans>Crypto Trends</Trans>,
        [ExploreType.TopChannels]: <Trans>Trending Channels</Trans>,
    };

    return (
        <>
            <SourceTabs className="!z-20 md:!top-[57px]">
                {EXPLORE_TYPES.map((x) => (
                    <SourceTab
                        className="whitespace-nowrap text-base"
                        key={x}
                        href={resolveExploreUrl(
                            x,
                            x === ExploreType.TopProfiles ? Source.Farcaster : TrendingType.TopGainers,
                        )}
                        isActive={x === params.explore}
                    >
                        {labels[x]}
                    </SourceTab>
                ))}
            </SourceTabs>
            {children}
        </>
    );
}
