import type { Metadata } from 'next';

import { ArticleDetailPage } from '@/app/(normal)/article/[id]/pages/DetailPage.js';
import { KeyType } from '@/constants/enum.js';
import { createArticlePageMetadataById } from '@/helpers/createPageMetadata.js';
import { isBotRequest } from '@/helpers/isBotRequest.js';
import { memoizeWithRedis } from '@/helpers/memoizeWithRedis.js';

const createMetadata = memoizeWithRedis(createArticlePageMetadataById, {
    key: KeyType.CreateArticlePageMeatadaById,
});

interface Props {
    params: {
        id: string;
    };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    return createMetadata(params.id);
}

export default function Page(props: Props) {
    if (isBotRequest()) return null;
    return <ArticleDetailPage {...props} />;
}
