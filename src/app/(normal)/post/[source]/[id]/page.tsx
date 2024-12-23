import { Trans } from '@lingui/macro';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation.js';
import type React from 'react';

import { PostDetailPage } from '@/app/(normal)/post/[source]/[id]/pages/DetailPage.js';
import { Comeback } from '@/components/Comeback.js';
import { NotLoginFallback } from '@/components/NotLoginFallback.js';
import { KeyType, type SocialSourceInURL, Source } from '@/constants/enum.js';
import { createMetadataPostById } from '@/helpers/createMetadataPostById.js';
import { createSiteMetadata } from '@/helpers/createSiteMetadata.js';
import { isBotRequest } from '@/helpers/isBotRequest.js';
import { isSocialSourceInUrl } from '@/helpers/isSocialSource.js';
import { memoizeWithRedis } from '@/helpers/memoizeWithRedis.js';
import { resolveSocialSource } from '@/helpers/resolveSource.js';
import { setupTwitterSession } from '@/helpers/setupTwitterSession.js';
import { setupLocaleForSSR } from '@/i18n/index.js';
import { twitterSessionHolder } from '@/providers/twitter/SessionHolder.js';

export const revalidate = 60;

const createPageMetadata = memoizeWithRedis(createMetadataPostById, {
    key: KeyType.CreateMetadataPostById,
});

interface Props {
    params: {
        id: string;
        source: SocialSourceInURL;
    };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    if (isSocialSourceInUrl(params.source)) {
        return createPageMetadata(params.source, params.id);
    }
    return createSiteMetadata();
}

export default async function Page(props: Props) {
    setupLocaleForSSR();
    await setupTwitterSession();

    if (isBotRequest()) return null;

    const { params } = props;
    if (!isSocialSourceInUrl(params.source)) notFound();

    const source = resolveSocialSource(params.source);
    if (source === Source.Twitter && !twitterSessionHolder.session) {
        return (
            <article className="min-h-screen">
                <header className="sticky top-0 z-40 flex items-center border-b border-line bg-primaryBottom px-4 py-[18px]">
                    <Comeback className="mr-8" />
                    <h2 className="text-xl font-black leading-6">
                        <Trans>Details</Trans>
                    </h2>
                </header>
                <NotLoginFallback source={source} />
            </article>
        );
    }

    return <PostDetailPage id={params.id} source={source} />;
}
