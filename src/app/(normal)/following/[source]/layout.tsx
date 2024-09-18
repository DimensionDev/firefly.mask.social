import { t } from '@lingui/macro';
import { notFound } from 'next/navigation.js';
import { type PropsWithChildren } from 'react';

import { DISCOVER_SOURCES } from '@/constants/index.js';
import { Link } from '@/esm/Link.js';
import { classNames } from '@/helpers/classNames.js';
import { createPageTitleSSR } from '@/helpers/createPageTitle.js';
import { createSiteMetadata } from '@/helpers/createSiteMetadata.js';
import { isDiscoverSource } from '@/helpers/isDiscoverSource.js';
import { resolveFollowingUrl } from '@/helpers/resolveFollowingUrl.js';
import { resolveSourceFromUrlNoFallback } from '@/helpers/resolveSource.js';
import { resolveSourceName } from '@/helpers/resolveSourceName.js';

export async function generateMetadata() {
    return createSiteMetadata({
        title: createPageTitleSSR(t`Following`),
    });
}

export default function Layout({
    params,
    children,
}: PropsWithChildren<{
    params: {
        source: string;
    };
}>) {
    const source = resolveSourceFromUrlNoFallback(params.source);
    if (!source || !isDiscoverSource(source)) return notFound();
    return (
        <>
            <div className="no-scrollbar sticky top-[54px] z-40 w-full overflow-x-auto overflow-y-hidden border-b border-line bg-primaryBottom px-4 md:top-0">
                <nav className="flex space-x-4 text-xl" aria-label="Tabs">
                    {DISCOVER_SOURCES.map((x) => (
                        <Link
                            key={x}
                            href={resolveFollowingUrl(x)}
                            className={classNames(
                                'h-[43px] cursor-pointer border-b-2 px-4 text-center font-bold leading-[43px] hover:text-main md:h-[60px] md:py-[18px] md:leading-6',
                                x === source ? 'border-farcasterPrimary text-main' : 'border-transparent text-third',
                            )}
                            aria-current={source === x ? 'page' : undefined}
                        >
                            {resolveSourceName(x)}
                        </Link>
                    ))}
                </nav>
            </div>
            {children}
        </>
    );
}
