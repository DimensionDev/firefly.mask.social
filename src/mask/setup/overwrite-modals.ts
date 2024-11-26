import { SelectProviderModal } from '@masknet/shared';
import { ProviderType } from '@masknet/web3-shared-evm';

import { EVMWeb3 } from '@/mask/bindings/index.js';

SelectProviderModal.__unsafe_overwrite_methods__({
    async open() {
        await EVMWeb3.connect({
            providerType: ProviderType.CustomEvent,
        });
    },
});
