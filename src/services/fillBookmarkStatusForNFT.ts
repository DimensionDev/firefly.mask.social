import type { NonFungibleAsset } from '@masknet/web3-shared-base';

import { FireflyPlatform } from '@/constants/enum.js';
import { resolveNFTIdFromAsset } from '@/helpers/resolveNFTIdFromAsset.js';
import { runInSafeAsync } from '@/helpers/runInSafe.js';
import { FireflySocialMediaProvider } from '@/providers/firefly/SocialMedia.js';

export async function fillBookmarkStatusForNonFungibleAssets(assets: Array<NonFungibleAsset<number, number>>) {
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
