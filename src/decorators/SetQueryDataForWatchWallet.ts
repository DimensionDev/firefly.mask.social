import { type Draft, produce } from 'immer';

import { queryClient } from '@/configs/queryClient.js';
import { Source } from '@/constants/enum.js';
import { isSameAddress } from '@/helpers/isSameAddress.js';
import type { FireflySocialMedia } from '@/providers/firefly/SocialMedia.js';
import type { Article } from '@/providers/types/Article.js';
import type { ClassType } from '@/types/index.js';

export function toggleWatch(address: string, status: boolean) {
    type PagesData = { pages: Array<{ data: Article[] }> };
    const patcher = (old: Draft<PagesData> | undefined) => {
        if (!old) return old;
        return produce(old, (draft) => {
            for (const page of draft.pages) {
                if (!page) continue;
                for (const article of page.data) {
                    if (!isSameAddress(article.author.id, address)) continue;
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
            if (!isSameAddress(draft.author.id, address)) return;
            draft.author.isFollowing = status;
        });
    });
    queryClient.setQueryData(['follow-wallet', address.toLowerCase()], status);
}

const METHODS_BE_OVERRIDDEN = ['watchWallet', 'unwatchWallet'] as const;

type Provider = FireflySocialMedia;
export function SetQueryDataForWatchWallet() {
    return function decorator<T extends ClassType<Provider>>(target: T): T {
        function overrideMethod<K extends (typeof METHODS_BE_OVERRIDDEN)[number]>(key: K) {
            const method = target.prototype[key] as Provider[K];

            Object.defineProperty(target.prototype, key, {
                value: async (address: string) => {
                    const m = method as (address: string) => ReturnType<Provider[K]>;
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
