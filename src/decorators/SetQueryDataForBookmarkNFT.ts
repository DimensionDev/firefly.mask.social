import { queryClient } from '@/configs/queryClient.js';
import { FireflyPlatform } from '@/constants/enum.js';
import type { FireflySocialMedia } from '@/providers/firefly/SocialMedia.js';
import type { ClassType } from '@/types/index.js';

const METHODS_BE_OVERRIDDEN = ['bookmarkNFT', 'unbookmarkNFT'] as const;

function toggleBlock(id: string, status: boolean) {
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
