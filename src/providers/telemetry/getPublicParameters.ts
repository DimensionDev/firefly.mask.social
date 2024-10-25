import { ChainId } from '@masknet/web3-shared-solana';
import { getAccount } from '@wagmi/core';

import { config } from '@/configs/wagmiClient.js';
import { bom } from '@/helpers/bom.js';
import { runInSafe } from '@/helpers/runInSafe.js';
import { resolveWalletAdapter } from '@/providers/solana/resolveWalletAdapter.js';
import { useDeveloperSettingsState } from '@/store/useDeveloperSettingsStore.js';
import { useFireflyStateStore } from '@/store/useProfileStore.js';

export function getPublicParameters(eventId: string, previousEventId: string | null) {
    const evmAccount = runInSafe(() => getAccount(config));
    const solanaAdaptor = runInSafe(() => resolveWalletAdapter());
    const fireflyAccountId = useFireflyStateStore.getState().currentProfileSession?.profileId;

    return {
        public_uuid: eventId,
        public_previous_uuid: previousEventId,

        public_ua: bom.navigator?.userAgent,
        public_href: bom.location?.href,

        public_evm_address: evmAccount?.address,
        public_evm_chain_id: evmAccount?.chainId,
        public_solana_chain_id: ChainId.Mainnet,
        public_solana_address: solanaAdaptor?.publicKey?.toBase58(),

        public_account_id: fireflyAccountId,
        public_use_development_api: useDeveloperSettingsState.getState().developmentAPI,

        firefly_account_id: fireflyAccountId,
    };
}
