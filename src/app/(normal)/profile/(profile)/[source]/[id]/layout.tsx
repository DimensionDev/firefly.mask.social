import { notFound } from 'next/navigation.js';
import { type PropsWithChildren } from 'react';

import { ProfilePageLayout } from '@/app/(normal)/profile/pages/ProfilePageLayout.js';
import { SourceInURL } from '@/constants/enum.js';
import { isProfilePageSource } from '@/helpers/isProfilePageSource.js';
import { resolveSourceFromUrlNoFallback } from '@/helpers/resolveSource.js';
import { setupLocaleForSSR } from '@/i18n/index.js';

export default function Layout({
    children,
    params,
}: PropsWithChildren<{
    params: {
        id: string;
        source: SourceInURL;
    };
}>) {
    const id = params.id;
    const source = resolveSourceFromUrlNoFallback(params.source);
    if (!source || !isProfilePageSource(source)) notFound();
    const identity = { source, id };

    setupLocaleForSSR();

    return <ProfilePageLayout identity={identity}>{children}</ProfilePageLayout>;
}
