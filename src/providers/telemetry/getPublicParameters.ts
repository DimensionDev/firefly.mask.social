import { ChainId } from '@masknet/web3-shared-solana';
import { getAccount } from 'wagmi/actions';

import { config } from '@/configs/wagmiClient.js';
import { bom } from '@/helpers/bom.js';
import { runInSafe } from '@/helpers/runInSafe.js';
import { getWalletAdapter } from '@/providers/solana/getWalletAdapter.js';
import { useDeveloperSettingsState } from '@/store/useDeveloperSettingsStore.js';
import {
    useFarcasterStateStore,
    useFireflyStateStore,
    useLensStateStore,
    useTwitterStateStore,
} from '@/store/useProfileStore.js';

export function getPublicParameters(eventId: string, previousEventId: string | null) {
    const evmAccount = runInSafe(() => getAccount(config));
    const solanaAdaptor = runInSafe(() => getWalletAdapter());
    const fireflyAccountId = useFireflyStateStore.getState().currentProfileSession?.profileId;

    return {
        public_uuid: eventId,
        public_previous_uuid: previousEventId,

        public_ua: bom.navigator?.userAgent,
        public_href: bom.location?.href,

        public_evm_address: evmAccount?.address,
        public_evm_chain_id: evmAccount?.chainId,
        public_evm_caip10:
            evmAccount?.address && evmAccount.chainId
                ? `ethereum:${evmAccount.chainId}:${evmAccount.address}`
                : undefined,

        public_solana_chain_id: ChainId.Mainnet,
        public_solana_address: solanaAdaptor?.publicKey?.toBase58(),
        public_solana_caip10: solanaAdaptor?.publicKey
            ? `solana:${ChainId.Mainnet}:${solanaAdaptor.publicKey.toBase58()}`
            : undefined,

        public_account_id: fireflyAccountId,
        public_use_development_api: useDeveloperSettingsState.getState().developmentAPI,

        firefly_account_id: fireflyAccountId,

        // safary social login
        twitter_username: useTwitterStateStore.getState().currentProfile?.handle,
        lens_handle: useLensStateStore.getState().currentProfile?.handle,
        farcaster_id: useFarcasterStateStore.getState().currentProfile?.profileId,

        activity:
            bom.location?.pathname?.startsWith('/events') || bom.location?.pathname?.startsWith('/event/')
                ? bom.location.href
                : undefined,
    };
}
