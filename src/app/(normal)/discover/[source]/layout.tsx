import { notFound } from 'next/navigation.js';
import { type PropsWithChildren } from 'react';

import { SourceTabs } from '@/components/SourceTabs/index.js';
import { SourceTab } from '@/components/SourceTabs/SourceTab.js';
import { DISCOVER_SOURCES } from '@/constants/index.js';
import { isDiscoverSource } from '@/helpers/isDiscoverSource.js';
import { resolveDiscoverUrl } from '@/helpers/resolveDiscoverUrl.js';
import { resolveSourceFromUrlNoFallback } from '@/helpers/resolveSource.js';
import { resolveSourceName } from '@/helpers/resolveSourceName.js';

export default async function Layout(props: PropsWithChildren<{ params: Promise<{ source: string }> }>) {
    const params = await props.params;
    const { children } = props;

    const source = resolveSourceFromUrlNoFallback(params.source);

    if (!source || !isDiscoverSource(source)) {
        notFound();
    }

    return (
        <>
            <SourceTabs>
                {DISCOVER_SOURCES.map((x) => (
                    <SourceTab key={x} href={resolveDiscoverUrl(x)} isActive={x === source}>
                        {resolveSourceName(x)}
                    </SourceTab>
                ))}
            </SourceTabs>
            {children}
        </>
    );
}
