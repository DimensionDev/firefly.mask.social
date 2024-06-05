import { produce } from 'immer';

import { queryClient } from '@/configs/queryClient.js';
import { Source } from '@/constants/enum.js';
import type { FireflySocialMedia } from '@/providers/firefly/SocialMedia.js';
import type { Article } from '@/providers/types/Article.js';
import { WatchType } from '@/providers/types/SocialMedia.js';
import type { ClassType } from '@/types/index.js';

export function toggleWatch(address: string, status: boolean) {
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
                        article.author.isFollowing = status;
                    }
                }
            });
        },
    );
}

const METHODS_BE_OVERRIDDEN = ['watch', 'unwatch'] as const;

type Provider = FireflySocialMedia;
export function SetQueryDataForWatchWallet() {
    return function decorator<T extends ClassType<Provider>>(target: T): T {
        function overrideMethod<K extends (typeof METHODS_BE_OVERRIDDEN)[number]>(key: K) {
            const method = target.prototype[key] as Provider[K];

            Object.defineProperty(target.prototype, key, {
                value: async (watchType: WatchType, id: string) => {
                    const m = method as (watchType: WatchType, id: string) => ReturnType<Provider[K]>;
                    if (watchType !== WatchType.Wallet) {
                        return m.call(target.prototype, watchType, id);
                    }
                    const status = key === 'watch';
                    try {
                        toggleWatch(id, status);
                        return await m.call(target.prototype, watchType, id);
                    } catch (err) {
                        // rolling back
                        toggleWatch(id, !status);
                        throw err;
                    }
                },
            });
        }

        METHODS_BE_OVERRIDDEN.forEach(overrideMethod);

        return target;
    };
}
