import { t } from '@lingui/macro';
import { notFound } from 'next/navigation.js';
import { type PropsWithChildren } from 'react';

import { SourceTabs } from '@/components/SourceTabs/index.js';
import { SourceTab } from '@/components/SourceTabs/SourceTab.js';
import { SOCIAL_DISCOVER_SOURCE } from '@/constants/index.js';
import { createPageTitleSSR } from '@/helpers/createPageTitle.js';
import { createSiteMetadata } from '@/helpers/createSiteMetadata.js';
import { isDiscoverSource } from '@/helpers/isDiscoverSource.js';
import { resolveNotificationUrl } from '@/helpers/resolveNotificationUrl.js';
import { resolveSourceFromUrlNoFallback } from '@/helpers/resolveSource.js';
import { resolveSourceName } from '@/helpers/resolveSourceName.js';

export async function generateMetadata() {
    return createSiteMetadata({
        title: await createPageTitleSSR(t`Notifications`),
    });
}

export default async function Layout(props: PropsWithChildren<{ params: Promise<{ source: string }> }>) {
    const params = await props.params;
    const { children } = props;

    const source = resolveSourceFromUrlNoFallback(params.source);
    if (!source || !isDiscoverSource(source)) notFound();

    return (
        <>
            <SourceTabs>
                {SOCIAL_DISCOVER_SOURCE.map((x) => (
                    <SourceTab key={x} href={resolveNotificationUrl(x)} isActive={x === source}>
                        {resolveSourceName(x)}
                    </SourceTab>
                ))}
            </SourceTabs>
            {children}
        </>
    );
}
