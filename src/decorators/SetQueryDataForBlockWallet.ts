import { produce } from 'immer';

import { queryClient } from '@/configs/queryClient.js';
import { Source } from '@/constants/enum.js';
import type { FireflySocialMedia } from '@/providers/firefly/SocialMedia.js';
import type { Article } from '@/providers/types/Article.js';
import type { ClassType } from '@/types/index.js';

function toggleBlock(address: string, status: boolean) {
    queryClient.setQueriesData<{ pages: Array<{ data: Article[] }> }>(
        { queryKey: ['articles', 'discover', Source.Article] },
        (old) => {
            if (!old) return old;
            const addr = address.toLowerCase();
            return produce(old, (draft) => {
                for (const page of draft.pages) {
                    if (!page) continue;
                    for (const article of page.data) {
                        if (article.author.id.toLowerCase() !== addr) continue;
                        article.author.isMuted = status;
                    }
                }
            });
        },
    );
}

const METHODS_BE_OVERRIDDEN = ['blockAddress', 'unblockAddress'] as const;

type Provider = FireflySocialMedia;
export function SetQueryDataForBlockWallet() {
    return function decorator<T extends ClassType<Provider>>(target: T): T {
        function overrideMethod<K extends (typeof METHODS_BE_OVERRIDDEN)[number]>(key: K) {
            const method = target.prototype[key] as Provider[K];

            Object.defineProperty(target.prototype, key, {
                value: async (address: string) => {
                    const m = method as (address: string) => ReturnType<Provider[K]>;
                    const status = key === 'blockAddress';
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
