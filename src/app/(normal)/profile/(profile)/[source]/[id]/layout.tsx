import { notFound } from 'next/navigation.js';
import { type PropsWithChildren } from 'react';

import { ProfilePageLayout } from '@/app/(normal)/profile/pages/ProfilePageLayout.js';
import { NotLoginFallback } from '@/components/NotLoginFallback.js';
import { Source, SourceInURL } from '@/constants/enum.js';
import { isProfilePageSource } from '@/helpers/isProfilePageSource.js';
import { resolveSourceFromUrlNoFallback } from '@/helpers/resolveSource.js';
import { setupTwitterSession } from '@/helpers/setupTwitterSession.js';
import { setupLocaleForSSR } from '@/i18n/index.js';
import { twitterSessionHolder } from '@/providers/twitter/SessionHolder.js';

export default async function Layout({
    children,
    params,
}: PropsWithChildren<{
    params: {
        id: string;
        source: SourceInURL;
    };
}>) {
    setupLocaleForSSR();
    await setupTwitterSession();
    const id = params.id;
    const source = resolveSourceFromUrlNoFallback(params.source);
    if (!source || !isProfilePageSource(source)) notFound();
    const identity = { source, id };

    if (source === Source.Twitter && !twitterSessionHolder.session) {
        return <NotLoginFallback source={source} />;
    }

    return <ProfilePageLayout identity={identity}>{children}</ProfilePageLayout>;
}
