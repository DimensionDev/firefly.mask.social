import type { Metadata } from 'next';

import { ArticleDetailPage } from '@/app/(normal)/article/[id]/pages/DetailPage.js';
import { KeyType } from '@/constants/enum.js';
import { createSiteMetadata } from '@/helpers/createSiteMetadata.js';
import { isBotRequest } from '@/helpers/isBotRequest.js';
import { memoizeWithRedis } from '@/helpers/memoizeWithRedis.js';
import { getArticleOGById } from '@/services/getArticleOGById.js';

const getArticleOGByIdRedis = memoizeWithRedis(getArticleOGById, {
    key: KeyType.GetArticleOGById,
});

interface Props {
    params: {
        id: string;
    };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    if (isBotRequest()) return getArticleOGByIdRedis(params.id);
    return createSiteMetadata();
}

export default function Page(props: Props) {
    if (isBotRequest()) return null;
    return <ArticleDetailPage {...props} />;
}
