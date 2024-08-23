import type { Metadata } from 'next';
import type React from 'react';

import { PostDetailPage } from '@/app/(normal)/post/[id]/pages/DetailPage.js';
import { RequireLogin } from '@/components/RequireLogin.js';
import { KeyType, type SocialSourceInURL } from '@/constants/enum.js';
import { createSiteMetadata } from '@/helpers/createSiteMetadata.js';
import { isBotRequest } from '@/helpers/isBotRequest.js';
import { isSocialSourceInURL } from '@/helpers/isSocialSource.js';
import { memoizeWithRedis } from '@/helpers/memoizeWithRedis.js';
import { resolveSocialSource } from '@/helpers/resolveSource.js';
import { getPostOGById } from '@/services/getPostOGById.js';

const getPostOGByIdRedis = memoizeWithRedis(getPostOGById, {
    key: KeyType.GetPostOGById,
});

interface Props {
    params: {
        id: string;
    };
    searchParams: { source: SocialSourceInURL };
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
    if (isSocialSourceInURL(searchParams.source)) {
        return getPostOGByIdRedis(searchParams.source, params.id);
    }
    return createSiteMetadata();
}

export default function Page(props: Props) {
    if (isBotRequest()) return null;
    return (
        <RequireLogin source={resolveSocialSource(props.searchParams.source)}>
            <PostDetailPage {...props} />;
        </RequireLogin>
    );
}
