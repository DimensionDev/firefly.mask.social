import type { Metadata } from 'next';

import { ArticleDetailPage } from '@/app/(normal)/article/[id]/pages/DetailPage.js';
import { KeyType } from '@/constants/enum.js';
import { createMetadataArticleById } from '@/helpers/createMetadataArticleById.js';
import { isBotRequest } from '@/helpers/isBotRequest.js';
import { memoizeWithRedis } from '@/helpers/memoizeWithRedis.js';

const createPageMetadata = memoizeWithRedis(createMetadataArticleById, {
    key: KeyType.CreateMetadataArticleById,
});

interface Props {
    params: {
        id: string;
    };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    return createPageMetadata(params.id);
}

export default function Page(props: Props) {
    if (isBotRequest()) return null;
    return <ArticleDetailPage {...props} />;
}
