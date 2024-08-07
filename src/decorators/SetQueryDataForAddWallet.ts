import { produce } from 'immer';

import { queryClient } from '@/configs/queryClient.js';
import { Source } from '@/constants/enum.js';
import { formatEthereumAddress } from '@/helpers/formatEthereumAddress.js';
import { isSameAddress } from '@/helpers/isSameAddress.js';
import type { FireflySocialMedia } from '@/providers/firefly/SocialMedia.js';
import type { BindWalletResponse, FireflyProfile } from '@/providers/types/Firefly.js';
import type { ClassType } from '@/types/index.js';

type Provider = FireflySocialMedia;
type WalletsData = Record<
    'connected' | 'related',
    Array<{
        profile: FireflyProfile;
        relations: FireflyProfile[];
    }>
>;

const METHODS_BE_OVERRIDDEN = ['verifyAndBindWallet'] as const;

function updateWalletFromQueryData(data: BindWalletResponse['data']) {
    queryClient.setQueriesData<WalletsData>(
        {
            queryKey: ['my-wallets'],
        },
        (old) => {
            if (!old) return old;
            return produce(old, (draft) => {
                if (
                    !data ||
                    [...draft.connected, ...draft.related].some((x) => isSameAddress(x.profile.identity, data.address))
                )
                    return;
                draft.connected.push({
                    profile: {
                        source: Source.Wallet,
                        identity: data.address,
                        displayName: data.ens || formatEthereumAddress(data.address, 4),
                        __origin__: {
                            address: data.address,
                            ens: data.ens ? [data.ens] : [],
                            blockchain: data.blockchain,
                            is_connected: true,
                            verifiedSources: [],
                            avatar: '',
                            primary_ens: data.ens,
                        },
                    },
                    relations: [],
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
