import type { Address } from 'viem';

export interface DebankToken<T = Address> {
    amount: number;
    chain: string;
    decimals: number;
    display_symbol: string | null;
    id: T;
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

export type Token<T = Address> = DebankToken<T> & {
    chainId: number;
    balance: string;
    usdValue: number;
};

export interface TransactionOptions<AddressLike = Address> {
    to: AddressLike;
    amount: string;
    token: Token<AddressLike>;
}

export interface Transfer<AddressLike = string, HashLike = string> {
    transfer: (options: TransactionOptions<AddressLike>) => Promise<HashLike>;
    isNativeToken: (token: Token) => boolean;
    waitForTransaction: (hash: HashLike) => Promise<void>;
    validateBalance: (options: TransactionOptions<AddressLike>) => Promise<boolean>;
    validateGas: (options: TransactionOptions<AddressLike>) => Promise<boolean>;
    _transferNative: (options: TransactionOptions<AddressLike>) => Promise<HashLike>;
    _transferContract: (options: TransactionOptions<AddressLike>) => Promise<HashLike>;
}
