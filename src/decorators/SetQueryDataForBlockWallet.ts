import { type Draft, produce } from 'immer';

import { queryClient } from '@/configs/queryClient.js';
import type { FireflySocialMedia } from '@/providers/firefly/SocialMedia.js';
import type { Article } from '@/providers/types/Article.js';
import type { ClassType } from '@/types/index.js';
import { Source } from '@/constants/enum.js';

function toggleBlock(address: string, status: boolean) {
    type PagesData = { pages: Array<{ data: Article[] }> };
    const addr = address.toLowerCase();
    const patcher = (old: Draft<PagesData> | undefined) => {
        if (!old) return old;
        return produce(old, (draft) => {
            for (const page of draft.pages) {
                if (!page) continue;
                for (const article of page.data) {
                    if (article.author.id.toLowerCase() !== addr) continue;
                    article.author.isMuted = status;
                }
            }
        });
    };
    queryClient.setQueriesData<{ pages: Array<{ data: Article[] }> }>({ queryKey: ['articles'] }, patcher);
    queryClient.setQueriesData<PagesData>({ queryKey: ['posts', Source.Article, 'bookmark'] }, patcher);
    queryClient.setQueriesData<Article>({ queryKey: ['article-detail'] }, (old) => {
        if (!old) return;
        return produce(old, (draft) => {
            if (draft.author.id.toLowerCase() !== addr) return;
            draft.author.isMuted = status;
        });
    });
}

const METHODS_BE_OVERRIDDEN = ['blockWallet', 'unblockWallet'] as const;

type Provider = FireflySocialMedia;
export function SetQueryDataForBlockWallet() {
    return function decorator<T extends ClassType<Provider>>(target: T): T {
        function overrideMethod<K extends (typeof METHODS_BE_OVERRIDDEN)[number]>(key: K) {
            const method = target.prototype[key] as Provider[K];

            Object.defineProperty(target.prototype, key, {
                value: async (address: string) => {
                    const m = method as (address: string) => ReturnType<Provider[K]>;
                    const status = key === 'blockWallet';
                    try {
                        toggleBlock(address, status);
                        return await m.call(target.prototype, address);
                    } catch (err) {
                        // rolling back
                        toggleBlock(address, !status);
                        throw err;
                    }
                },
            });
        }

        METHODS_BE_OVERRIDDEN.forEach(overrideMethod);

        return target;
    };
}
