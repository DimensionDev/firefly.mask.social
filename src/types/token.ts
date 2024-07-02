import { useNetworks } from '@masknet/web3-hooks-base';
import { ChainId } from '@masknet/web3-shared-evm';

export interface UserToken {
    amount: number;
    chain: string;
    decimals: number;
    display_symbol: string | null;
    id: `0x${string}`;
    is_core: boolean;
    is_verified: boolean;
    is_wallet: boolean;
    logo_url: string;
    name: string;
    optimized_symbol: string;
    price: number;
    price_24h_change: number;
    protocol_id: string;
    raw_amount: string;
    raw_amount_hex_str: string;
    symbol: string;
    time_at: number;
}

export type TipsToken = UserToken & {
    chainId: ChainId | null;
    network: ReturnType<typeof useNetworks>[0];
    balance: string;
}
