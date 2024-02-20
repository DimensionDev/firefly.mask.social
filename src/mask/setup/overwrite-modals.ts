import { SelectProviderModal } from '@masknet/shared';
import { EVMWeb3 } from '@masknet/web3-providers';
import { ProviderType } from '@masknet/web3-shared-evm';

SelectProviderModal.__unsafe_overwrite_methods__({
    async open() {
        await EVMWeb3.connect({
            providerType: ProviderType.CustomEvent,
        });
    },
});
