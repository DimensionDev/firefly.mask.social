import { produce } from 'immer';

import { queryClient } from '@/configs/queryClient.js';
import type { FireflyPlatform } from '@/constants/enum.js';
import { isSameAddress } from '@/helpers/isSameAddress.js';
import type { FireflySocialMedia } from '@/providers/firefly/SocialMedia.js';
import type { WalletConnection } from '@/providers/types/Firefly.js';
import type { ProfileTab } from '@/store/useProfileTabStore.js';
import type { ClassType } from '@/types/index.js';

type Provider = FireflySocialMedia;
type WalletsData = Record<
    'connected' | 'related',
    Array<{
        walletConnection: WalletConnection;
        platforms: ProfileTab[];
    }>
>;
type ReportOptions = Parameters<FireflySocialMedia['reportAndDeleteWallet']>[0];

const METHODS_BE_OVERRIDDEN = ['disconnectAccount'] as const;
const METHODS_BE_OVERRIDDEN_FOR_REPORT = ['reportAndDeleteWallet'] as const;

function deleteWalletsFromQueryData(address: string) {
    queryClient.setQueriesData<WalletsData>(
        {
            queryKey: ['my-wallets'],
        },
        (old) => {
            if (!old) return old;
            return produce(old, (draft) => {
                draft.connected = draft.connected.filter((x) =>
                    isSameAddress(x.walletConnection.address, address, 'both'),
                );
                draft.related = draft.related.filter((x) => isSameAddress(x.walletConnection.address, address, 'both'));
            });
        },
    );
}

export function SetQueryDataForDeleteWallet() {
    return function decorator<T extends ClassType<Provider>>(target: T): T {
        function overrideMethod<K extends (typeof METHODS_BE_OVERRIDDEN)[number]>(key: K) {
            const method = target.prototype[key] as Provider[K];

            Object.defineProperty(target.prototype, key, {
                value: async (platform: FireflyPlatform, identity: string, address: string) => {
                    const m = method as (
                        platform: FireflyPlatform,
                        identity: string,
                        address: string,
                    ) => ReturnType<Provider[K]>;
                    const result = await m.call(target.prototype, platform, identity, address);
                    deleteWalletsFromQueryData(address);
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
                    deleteWalletsFromQueryData(options.walletAddress);
                    return result;
                },
            });
        }

        METHODS_BE_OVERRIDDEN_FOR_REPORT.forEach(overrideMethod);

        return target;
    };
}
