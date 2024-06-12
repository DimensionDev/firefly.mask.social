import {
    createIndicator,
    createNextIndicator,
    createPageable,
    EMPTY_LIST,
    type PageIndicator,
} from '@masknet/shared-base';
import urlcat from 'urlcat';

import { fireflySessionHolder } from '@/providers/firefly/SessionHolder.js';
import type { NFTCollectionsResponse } from '@/providers/types/Firefly.js';
import { settings } from '@/settings/index.js';

export interface Params {
    limit?: number;
    indicator?: PageIndicator;
    twitterId?: string;
    walletAddress?: string;
    lensHandle?: string;
    farcasterUsername?: string;
    fid?: string;
    lensProfileId?: string;
}

/**
 * Retrieve all NFT collections from the linked wallets associated with a particular user.
 *
 * @param params
 * @returns
 */
export async function getAllNFTCollections(params: Params) {
    const { indicator, walletAddress, limit } = params ?? {};
    const url = urlcat(settings.FIREFLY_ROOT_URL, 'v2/user/nftCollections', {
        walletAddress,
        limit: limit || 25,
        cursor: indicator?.id || undefined,
    });
    const response = await fireflySessionHolder.fetch<NFTCollectionsResponse>(url);
    return createPageable(
        response.data?.collections ?? EMPTY_LIST,
        createIndicator(indicator),
        response.data?.cursor ? createNextIndicator(indicator, `${response.data.cursor}`) : undefined,
    );
}
