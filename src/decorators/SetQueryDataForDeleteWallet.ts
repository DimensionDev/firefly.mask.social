import { produce } from 'immer';

import { queryClient } from '@/configs/queryClient.js';
import type { FireflySocialMedia } from '@/providers/firefly/SocialMedia.js';
import type { FireflyProfile } from '@/providers/types/Firefly.js';
import type { ClassType } from '@/types/index.js';

type Provider = FireflySocialMedia;
type WalletsData = Record<
    'connected' | 'related',
    Array<{
        profile: FireflyProfile;
        relations: FireflyProfile[];
    }>
>;
type ReportOptions = Parameters<FireflySocialMedia['reportAndDeleteWallet']>[0];

const METHODS_BE_OVERRIDDEN = ['deleteWallet'] as const;
const METHODS_BE_OVERRIDDEN_FOR_REPORT = ['reportAndDeleteWallet'] as const;

function deleteWalletsFromQueryData(addresses: string[]) {
    queryClient.setQueriesData<WalletsData>(
        {
            queryKey: ['my-wallets'],
        },
        (old) => {
            if (!old) return old;
            return produce(old, (draft) => {
                for (const address of addresses) {
                    draft.connected = draft.connected.filter((x) => x.profile.identity !== address);
                    draft.related = draft.related.filter((x) => x.profile.identity !== address);
                }
            });
        },
    );
}

export function SetQueryDataForDeleteWallet() {
    return function decorator<T extends ClassType<Provider>>(target: T): T {
        function overrideMethod<K extends (typeof METHODS_BE_OVERRIDDEN)[number]>(key: K) {
            const method = target.prototype[key] as Provider[K];

            Object.defineProperty(target.prototype, key, {
                value: async (addresses: string[]) => {
                    const m = method as (addresses: string[]) => ReturnType<Provider[K]>;
                    const result = await m.call(target.prototype, addresses);
                    deleteWalletsFromQueryData(addresses);
                    return result;
                },
            });
        }

        METHODS_BE_OVERRIDDEN.forEach(overrideMethod);

        return target;
    };
}

export function SetQueryDataForReportAndDeleteWallet() {
    return function decorator<T extends ClassType<Provider>>(target: T): T {
        function overrideMethod<K extends (typeof METHODS_BE_OVERRIDDEN_FOR_REPORT)[number]>(key: K) {
            const method = target.prototype[key] as Provider[K];

            Object.defineProperty(target.prototype, key, {
                value: async (options: ReportOptions) => {
                    const m = method as (options: ReportOptions) => ReturnType<Provider[K]>;
                    const result = await m.call(target.prototype, options);
                    deleteWalletsFromQueryData([options.walletAddress]);
                    return result;
                },
            });
        }

        METHODS_BE_OVERRIDDEN_FOR_REPORT.forEach(overrideMethod);

        return target;
    };
}
