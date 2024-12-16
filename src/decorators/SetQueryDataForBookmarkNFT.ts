import { type Draft, produce } from 'immer';

import { queryClient } from '@/configs/queryClient.js';
import { FireflyPlatform } from '@/constants/enum.js';
import { resolveNFTIdFromAsset } from '@/helpers/resolveNFTIdFromAsset.js';
import type { FireflySocialMedia } from '@/providers/firefly/SocialMedia.js';
import type { NFTAsset } from '@/providers/types/Firefly.js';
import type { SimpleHash } from '@/providers/simplehash/type.js';
import type { ClassType } from '@/types/index.js';

const METHODS_BE_OVERRIDDEN = ['bookmarkNFT', 'unbookmarkNFT'] as const;

type PageData<T> = { pages: Array<{ data: T[] }> };

function createUpdater<T>(updater: (item: Draft<T>) => void) {
    return (old?: PageData<T>) => {
        if (!old) return old;

        return produce(old, (draft) => {
            draft.pages.forEach((page) => {
                page.data.forEach((item) => {
                    updater(item);
                });
            });
        });
    };
}

function toggleBlock(id: string, status: boolean) {
    queryClient.setQueriesData<PageData<SimpleHash.LiteCollection>>(
        { queryKey: ['nft-collection-list'] },
        createUpdater<SimpleHash.LiteCollection>((collection) => {
            collection.nftPreviews?.forEach((preview) => {
                if (preview.nft_id === id) preview.hasBookmarked = status;
            });
        }),
    );
    queryClient.setQueriesData<PageData<NFTAsset>>(
        { queryKey: ['poap-list'] },
        createUpdater<NFTAsset>((item) => {
            if (resolveNFTIdFromAsset(item) === id) {
                item.hasBookmarked = status;
            }
        }),
    );
    queryClient.setQueryData(['has-bookmarked', FireflyPlatform.NFTs, id], status);
}

export function SetQueryDataForBookmarkNFT() {
    return function decorator<T extends ClassType<FireflySocialMedia>>(target: T): T {
        function overrideMethod<K extends (typeof METHODS_BE_OVERRIDDEN)[number]>(key: K) {
            const method = target.prototype[key] as FireflySocialMedia[K];

            Object.defineProperty(target.prototype, key, {
                value: async (id: string, owner?: string) => {
                    const m = method as (id: string, owner?: string) => ReturnType<FireflySocialMedia[K]>;
                    const status = key === 'bookmarkNFT';

                    const result = await m.call(target.prototype, id, owner);
                    if (result) {
                        toggleBlock(id, status);
                    }

                    return result;
                },
            });
        }

        METHODS_BE_OVERRIDDEN.forEach(overrideMethod);

        return target;
    };
}
