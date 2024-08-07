import { safeUnreachable } from '@masknet/kit';
import { produce } from 'immer';

import { queryClient } from '@/configs/queryClient.js';
import { isSameAddress, isSameSolanaAddress } from '@/helpers/isSameAddress.js';
import type { FireflySocialMedia } from '@/providers/firefly/SocialMedia.js';
import type { FireflyWalletConnection } from '@/providers/types/Firefly.js';
import type { ClassType } from '@/types/index.js';

type Provider = FireflySocialMedia;
type WalletsData = Record<'connected' | 'related', FireflyWalletConnection[]>;
type ReportOptions = Parameters<FireflySocialMedia['reportAndDeleteWallet']>[0];

const METHODS_BE_OVERRIDDEN = ['disconnectWallet'] as const;
const METHODS_BE_OVERRIDDEN_FOR_REPORT = ['reportAndDeleteWallet'] as const;

function isConnectionAddress(connection: FireflyWalletConnection, address: string) {
    switch (connection.platform) {
        case 'eth':
            return isSameAddress(connection.address, address);
        case 'solana':
            return isSameSolanaAddress(connection.address, address);
        default:
            safeUnreachable(connection.platform);
            return false;
    }
}

function deleteWalletsFromQueryData(address: string) {
    queryClient.setQueriesData<WalletsData>(
        {
            queryKey: ['my-wallet-connections'],
        },
        (old) => {
            if (!old) return old;
            return produce(old, (draft) => {
                draft.connected = draft.connected.filter((x) => !isConnectionAddress(x, address));
                draft.related = draft.related.filter((x) => !isConnectionAddress(x, address));
            });
        },
    );
}

export function SetQueryDataForDeleteWallet() {
    return function decorator<T extends ClassType<Provider>>(target: T): T {
        function overrideMethod<K extends (typeof METHODS_BE_OVERRIDDEN)[number]>(key: K) {
            const method = target.prototype[key] as Provider[K];

            Object.defineProperty(target.prototype, key, {
                value: async (address: string) => {
                    const m = method as (address: string) => ReturnType<Provider[K]>;
                    const result = await m.call(target.prototype, address);
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
                value: async (connection: FireflyWalletConnection, reason: string) => {
                    const m = method as (options: ReportOptions, reason: string) => ReturnType<Provider[K]>;
                    const result = await m.call(target.prototype, connection, reason);
                    deleteWalletsFromQueryData(connection.address);
                    return result;
                },
            });
        }

        METHODS_BE_OVERRIDDEN_FOR_REPORT.forEach(overrideMethod);

        return target;
    };
}
