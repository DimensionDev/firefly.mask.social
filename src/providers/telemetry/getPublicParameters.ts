import { ChainId } from '@masknet/web3-shared-solana';
import { getClient } from '@wagmi/core';

import { config } from '@/configs/wagmiClient.js';
import { bom } from '@/helpers/bom.js';
import { resolveWalletAdapter } from '@/providers/solana/resolveWalletAdapter.js';
import { useDeveloperSettingsState } from '@/store/useDeveloperSettingsStore.js';
import { useFireflyStateStore } from '@/store/useProfileStore.js';

export function getPublicParameters(eventId: string, previousEventId: string | null) {
    const evmClient = getClient(config);
    const solanaAdaptor = resolveWalletAdapter();
    return {
        public_uuid: eventId,
        public_previous_uuid: previousEventId,

        public_ua: bom.navigator?.userAgent,
        public_href: bom.location?.href,

        public_evm_address: evmClient?.account?.address,
        public_evm_chain_id: evmClient?.chain.id,
        public_solana_chain_id: ChainId.Mainnet,
        public_solana_address: solanaAdaptor.publicKey?.toBase58(),

        public_account_id: useFireflyStateStore.getState().currentProfileSession?.profileId,
        public_use_development_api: useDeveloperSettingsState.getState().useDevelopmentAPI,

        firefly_account_id: useFireflyStateStore.getState().currentProfileSession?.profileId,
    };
}
