import type { Metadata } from 'next';

import { ArticleDetailPage } from '@/app/(normal)/article/[id]/pages/DetailPage.js';
import { KeyType } from '@/constants/enum.js';
import { createMetadataArticleById } from '@/helpers/createMetadataArticleById.js';
import { isBotRequest } from '@/helpers/isBotRequest.js';
import { memoizeWithRedis } from '@/helpers/memoizeWithRedis.js';
import { setupLocaleForSSR } from '@/i18n/index.js';
import { use } from 'react';

const createPageMetadata = memoizeWithRedis(createMetadataArticleById, {
    key: KeyType.CreateMetadataArticleById,
});

interface Props {
    params: Promise<{
        id: string;
    }>;
}

export async function generateMetadata(props: Props): Promise<Metadata> {
    const params = await props.params;
    return createPageMetadata(params.id);
}

export default async function Page(props: Props) {
    if (await isBotRequest()) return null;
    await setupLocaleForSSR();
    const param = use(props.params);
    return <ArticleDetailPage id={param.id} />;
}
