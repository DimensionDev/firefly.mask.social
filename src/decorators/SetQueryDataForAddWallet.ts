import { produce } from 'immer';

import { queryClient } from '@/configs/queryClient.js';
import { FireflyPlatform, NetworkType, WalletSource } from '@/constants/enum.js';
import { isSameEthereumAddress } from '@/helpers/isSameAddress.js';
import type { FireflyEndpoint } from '@/providers/firefly/Endpoint.js';
import type { BindWalletResponse, FireflyWalletConnection } from '@/providers/types/Firefly.js';
import type { ClassType } from '@/types/index.js';

type Provider = FireflyEndpoint;
type WalletsData = Record<'connected' | 'related', FireflyWalletConnection[]>;

const METHODS_BE_OVERRIDDEN = ['verifyAndBindWallet'] as const;

function updateWalletFromQueryData(data: BindWalletResponse['data']) {
    if (!data) return;
    queryClient.setQueriesData<WalletsData>(
        {
            queryKey: ['my-wallet-connections'],
        },
        (old) => {
            if (!old || [...old.connected, ...old.related].some((x) => isSameEthereumAddress(x.address, data.address)))
                return old;
            return produce(old, (draft) => {
                draft.connected.push({
                    address: data.address,
                    avatar: '',
                    canReport: false,
                    ens: Array.isArray(data.ens) ? data.ens : data.ens ? [data.ens] : [],
                    platform: data.blockchain === NetworkType.Solana ? 'solana' : 'eth',
                    provider: FireflyPlatform.Firefly,
                    source: WalletSource.Firefly,
                    sources: [],
                    twitterId: '',
                    identities: [],
                });
            });
        },
    );
}

export function SetQueryDataForAddWallet() {
    return function decorator<T extends ClassType<Provider>>(target: T): T {
        function overrideMethod<K extends (typeof METHODS_BE_OVERRIDDEN)[number]>(key: K) {
            const method = target.prototype[key] as Provider[K];

            Object.defineProperty(target.prototype, key, {
                value: async (signMessage: string, signature: string) => {
                    const m = method as (signMessage: string, signature: string) => ReturnType<Provider[K]>;
                    const result = await m.call(target.prototype, signMessage, signature);
                    updateWalletFromQueryData(result);
                    return result;
                },
            });
        }

        METHODS_BE_OVERRIDDEN.forEach(overrideMethod);

        return target;
    };
}
