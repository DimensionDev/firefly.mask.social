import { t, Trans } from '@lingui/macro';
import { redirect } from 'next/navigation.js';
import type { PropsWithChildren } from 'react';

import { SourceTabs } from '@/components/SourceTabs/index.js';
import { SourceTab } from '@/components/SourceTabs/SourceTab.js';
import { ExploreType, Source } from '@/constants/enum.js';
import { EXPLORE_TYPES } from '@/constants/index.js';
import { createPageTitleSSR } from '@/helpers/createPageTitle.js';
import { createSiteMetadata } from '@/helpers/createSiteMetadata.js';
import { getUrlFromHeaders } from '@/helpers/getUrlFromHeaders.js';
import { isExploreType } from '@/helpers/isExploreType.js';
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

    if (isExploreType(params.explore) && getUrlFromHeaders()?.pathname === `/${params.explore}`) {
        if (params.explore !== ExploreType.CryptoTrends) {
            redirect(resolveExploreUrl(params.explore, Source.Farcaster));
        }
    }

    const labels: Record<ExploreType, React.ReactNode> = {
        [ExploreType.TopProfiles]: <Trans>Top Profiles</Trans>,
        [ExploreType.CryptoTrends]: <Trans>Crypto Trends</Trans>,
        [ExploreType.TopChannels]: <Trans>Trending Channels</Trans>,
    };

    return (
        <>
            <SourceTabs>
                {EXPLORE_TYPES.map((x) => (
                    <SourceTab
                        className="text-base"
                        key={x}
                        href={resolveExploreUrl(x, Source.Farcaster)}
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
