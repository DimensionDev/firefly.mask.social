import type { Metadata } from 'next';

import { TrendingChannelPage } from '@/app/(normal)/trending/pages/TrendingPage.js';
import { type SocialSourceInURL } from '@/constants/enum.js';
import { createSiteMetadata } from '@/helpers/createSiteMetadata.js';
import { isBotRequest } from '@/helpers/isBotRequest.js';

interface Props {
    searchParams: {
        source: SocialSourceInURL;
    };
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
    return createSiteMetadata();
}

export default function Page(props: Props) {
    if (isBotRequest()) return null;

    return <TrendingChannelPage {...props} />;
}
