import { type Draft, produce } from 'immer';

import { queryClient } from '@/configs/queryClient.js';
import { Source } from '@/constants/enum.js';
import { isSameEthereumAddress } from '@/helpers/isSameAddress.js';
import type { FireflyEndpoint } from '@/providers/firefly/Endpoint.js';
import type { Article } from '@/providers/types/Article.js';
import { type PolymarketActivity, WatchType } from '@/providers/types/Firefly.js';
import type { ClassType } from '@/types/index.js';

type PagesData = { pages: Array<{ data: Article[] }> };
type PolymarketPagesData = { pages: Array<{ data: PolymarketActivity[] }> };

function toggleWatch(address: string, status: boolean) {
    const patcher = (old: Draft<PagesData> | undefined) => {
        if (!old) return old;
        return produce(old, (draft) => {
            for (const page of draft.pages) {
                if (!page) continue;
                for (const article of page.data) {
                    if (!isSameEthereumAddress(article.author.id, address)) continue;
                    article.author.isFollowing = status;
                }
            }
        });
    };
    queryClient.setQueriesData<PagesData>({ queryKey: ['articles'] }, patcher);
    queryClient.setQueriesData<PagesData>({ queryKey: ['posts', Source.Article, 'bookmark'] }, patcher);
    queryClient.setQueriesData<Article>({ queryKey: ['article-detail'] }, (old) => {
        if (!old) return;
        return produce(old, (draft) => {
            if (!isSameEthereumAddress(draft.author.id, address)) return;
            draft.author.isFollowing = status;
        });
    });
    queryClient.setQueryData(['follow-wallet', address.toLowerCase()], status);

    const polymarketPatcher = (old: Draft<PolymarketPagesData> | undefined) => {
        if (!old || status) return old;
        return produce(old, (draft) => {
            for (const page of draft.pages) {
                if (!page) continue;
                page.data = page.data.filter(({ followingSources }) => {
                    if (
                        followingSources?.length === 1 &&
                        followingSources[0]?.type === WatchType.Wallet &&
                        isSameEthereumAddress(followingSources[0].walletAddress, address)
                    )
                        return false;

                    return true;
                });
            }
        });
    };
    queryClient.setQueriesData<PolymarketPagesData>({ queryKey: ['polymarket', 'following'] }, polymarketPatcher);
}

const METHODS_BE_OVERRIDDEN = ['watchWallet', 'unwatchWallet'] as const;

export function SetQueryDataForWatchWallet() {
    return function decorator<T extends ClassType<FireflyEndpoint>>(target: T): T {
        function overrideMethod<K extends (typeof METHODS_BE_OVERRIDDEN)[number]>(key: K) {
            const method = target.prototype[key] as FireflyEndpoint[K];

            Object.defineProperty(target.prototype, key, {
                value: async (address: string) => {
                    const m = method as (address: string) => ReturnType<FireflyEndpoint[K]>;
                    const status = key === 'watchWallet';
                    try {
                        toggleWatch(address, status);
                        return await m.call(target.prototype, address);
                    } catch (error) {
                        // rolling back
                        toggleWatch(address, !status);
                        throw error;
                    }
                },
            });
        }

        METHODS_BE_OVERRIDDEN.forEach(overrideMethod);

        return target;
    };
}
