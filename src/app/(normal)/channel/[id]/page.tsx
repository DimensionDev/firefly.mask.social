import type { Metadata } from 'next';

import { ChannelDetailPage } from '@/app/(normal)/channel/pages/DetailPage.js';
import { KeyType, type SocialSourceInURL } from '@/constants/enum.js';
import { createSiteMetadata } from '@/helpers/createSiteMetadata.js';
import { isBotRequest } from '@/helpers/isBotRequest.js';
import { memoizeWithRedis } from '@/helpers/memoizeWithRedis.js';
import { getChannelOGById } from '@/services/getChannelOGById.js';

const getChannelOGByIdRedis = memoizeWithRedis(getChannelOGById, {
    key: KeyType.GetChannelOGById,
});

interface Props {
    params: {
        id: string;
    };
    searchParams: {
        source: SocialSourceInURL;
    };
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
    if (isBotRequest() && searchParams.source) return getChannelOGByIdRedis(searchParams.source, params.id);
    return createSiteMetadata();
}

export default function Page(props: Props) {
    if (isBotRequest()) return null;

    return <ChannelDetailPage {...props} />;
}
