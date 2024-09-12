import { notFound, redirect } from 'next/navigation.js';
import React, { type PropsWithChildren } from 'react';

import { DiscoverSourceTabs } from '@/app/(normal)/pages/Discover.js';
import { DiscoverType } from '@/constants/enum.js';
import { getUrlFromHeaders } from '@/helpers/getUrlFromHeaders.js';
import { isDiscoverSource, isSocialDiscoverSource } from '@/helpers/isDiscoverSource.js';
import { resolveDiscoverUrl } from '@/helpers/resolveDiscoverUrl.js';
import { resolveSourceFromUrlNoFallback } from '@/helpers/resolveSource.js';

export default function Layout({
    params,
    children,
}: PropsWithChildren<{
    params: {
        source: string;
    };
}>) {
    const source = resolveSourceFromUrlNoFallback(params.source);

    if (!source || !isDiscoverSource(source)) {
        return notFound();
    }

    if (isSocialDiscoverSource(source) && getUrlFromHeaders()?.pathname === `/${params.source}`) {
        return redirect(resolveDiscoverUrl(source, DiscoverType.Trending));
    }

    return (
        <>
            <DiscoverSourceTabs source={source} />
            {children}
        </>
    );
}
