import urlcat from 'urlcat';

import { fetchJSON } from '@/helpers/fetchJSON.js';
import { WrtingNFTQuery } from '@/providers/mirror/query.js';
import { type ArticleDetailResponse } from '@/providers/mirror/type.js';
import type { ArticleCollectDetail } from '@/providers/types/Article.js';

class Mirror {
    async getArticleDetail(digest: string): Promise<ArticleCollectDetail> {
        const response = await fetchJSON<ArticleDetailResponse>(urlcat(location.origin, '/api/mirror'), {
            method: 'POST',
            body: JSON.stringify({
                ...WrtingNFTQuery,
                variables: {
                    digest,
                },
            }),
        });

        const result = response.data.data.entry.writingNFT;

        return {
            quantity: result.quantity,
            soldNum: result.optimisticNumSold,
            chainId: result.network.chainId,
            factorAddress: result.factoryAddress,
            proxyAddress: result.proxyAddress,
            price: result.price,
        };
    }
}

export const MirrorAPI = new Mirror();
