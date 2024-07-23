import urlcat from 'urlcat';

import { EMPTY_LIST } from '@/constants/index.js';
import { createIndicator, createNextIndicator, createPageable, type PageIndicator } from '@/helpers/pageable.js';
import { fireflySessionHolder } from '@/providers/firefly/SessionHolder.js';
import type { NFTCollectionsResponse } from '@/providers/types/Firefly.js';
import { settings } from '@/settings/index.js';

export interface Params {
    limit?: number;
    indicator?: PageIndicator;
    walletAddress: string;
}

/**
 * Retrieve all NFT collections from the linked wallets associated with a particular user.
 *
 * @param params
 * @returns
 */
export async function getWalletsNFTCollections(params: Params) {
    const { indicator, walletAddress, limit } = params ?? {};
    const url = urlcat(settings.FIREFLY_ROOT_URL, 'v2/user/walletsNftCollections', {
        walletAddresses: walletAddress,
        size: limit || 25,
        cursor: indicator?.id || undefined,
    });
    const response = await fireflySessionHolder.fetch<NFTCollectionsResponse>(url);
    return createPageable(
        response.data?.collections ?? EMPTY_LIST,
        createIndicator(indicator),
        response.data?.cursor ? createNextIndicator(indicator, `${response.data.cursor}`) : undefined,
    );
}
