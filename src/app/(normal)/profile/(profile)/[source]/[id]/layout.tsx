import { notFound } from 'next/navigation.js';
import { type PropsWithChildren } from 'react';

import { ProfilePageLayout } from '@/app/(normal)/profile/pages/ProfilePageLayout.js';
import { NotLoginFallback } from '@/components/NotLoginFallback.js';
import { ProfileSourceTabs } from '@/components/Profile/ProfileSourceTabs.js';
import { Source, SourceInURL } from '@/constants/enum.js';
import { isProfilePageSource } from '@/helpers/isProfilePageSource.js';
import { resolveSourceFromUrlNoFallback } from '@/helpers/resolveSource.js';
import { resolveSpecialProfileIdentity } from '@/helpers/resolveSpecialProfileIdentity.js';
import { runInSafeAsync } from '@/helpers/runInSafe.js';
import { setupTwitterSession } from '@/helpers/setupTwitterSession.js';
import { setupLocaleForSSR } from '@/i18n/index.js';
import { FireflyEndpointProvider } from '@/providers/firefly/Endpoint.js';
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
    const identity = resolveSpecialProfileIdentity({ source, id });

    const profiles = await runInSafeAsync(() =>
        FireflyEndpointProvider.getAllPlatformProfileByIdentity(identity, false),
    );

    if (!profiles?.length) notFound();

    if (source === Source.Twitter && !twitterSessionHolder.session) {
        return (
            <>
                <ProfileSourceTabs profiles={profiles} identity={identity} />
                <NotLoginFallback source={source} />
            </>
        );
    }

    return (
        <ProfilePageLayout identity={identity} profiles={profiles}>
            {children}
        </ProfilePageLayout>
    );
}
