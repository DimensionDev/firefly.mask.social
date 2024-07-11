import { SelectProviderModal } from '@masknet/shared';
import { EVMWeb3 } from '@masknet/web3-providers';

import { ProviderType } from '@/constants/ethereum.js';

SelectProviderModal.__unsafe_overwrite_methods__({
    async open() {
        await EVMWeb3.connect({
            providerType: ProviderType.CustomEvent,
        });
    },
});
