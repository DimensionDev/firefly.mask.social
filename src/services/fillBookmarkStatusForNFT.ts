import type { NonFungibleAsset } from '@masknet/web3-shared-base';

import { FireflyPlatform } from '@/constants/enum.js';
import type { Pageable, PageIndicator } from '@/helpers/pageable.js';
import { resolveNFTIdFromAsset } from '@/helpers/resolveNFTIdFromAsset.js';
import { runInSafeAsync } from '@/helpers/runInSafe.js';
import { FireflySocialMediaProvider } from '@/providers/firefly/SocialMedia.js';

async function fillBookmarkStatusForNonFungibleAssets(assets: Array<NonFungibleAsset<number, number>>) {
    const nftIds = assets.map((item) => resolveNFTIdFromAsset(item));
    if (!nftIds.length) return assets;

    const bookmarkData =
        (await runInSafeAsync(() => FireflySocialMediaProvider.getBookmarksByIds(FireflyPlatform.NFTs, nftIds))) || [];

    return assets.map((item) => ({
        ...item,
        hasBookmarked: bookmarkData.some(
            (bookmark) => bookmark.post_id === resolveNFTIdFromAsset(item) && !!bookmark.has_book_marked,
        ),
    }));
}

export async function fillBookmarkStatusForPagination(
    response: Pageable<NonFungibleAsset<number, number>, PageIndicator | undefined>,
) {
    return {
        ...response,
        data: await fillBookmarkStatusForNonFungibleAssets(response.data),
    };
}
