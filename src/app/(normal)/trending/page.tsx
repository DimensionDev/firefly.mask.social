import type { Metadata } from 'next';

import { TrendingChannelPage } from '@/app/(normal)/trending/pages/TrendingPage.js';
import { type SourceInURL } from '@/constants/enum.js';
import { createSiteMetadata } from '@/helpers/createSiteMetadata.js';
import { isBotRequest } from '@/helpers/isBotRequest.js';

interface Props {
    searchParams: {
        source: SourceInURL;
    };
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
    if (isBotRequest() && searchParams.source)
        // return getChannelOGByIdRedis(searchParams.source as SourceInURL, params.id); //TODO:
        return createSiteMetadata();
    return createSiteMetadata();
}

export default function Page(props: Props) {
    if (isBotRequest()) return null;

    return <TrendingChannelPage {...props} />;
}
