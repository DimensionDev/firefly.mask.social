import type { Token as DebankToken } from '@/providers/types/Debank.js';

export type Token<ChainIdLike = number, AddressLike = string> = DebankToken<AddressLike> & {
    chainId: ChainIdLike;
    balance: string;
    usdValue: number;
    chainLogoUrl?: string;
};

export interface TransactionOptions<ChainIdLike = number, AddressLike = string> {
    to: AddressLike;
    amount: string;
    token: Token<ChainIdLike, AddressLike>;
}

export interface TransferProvider<ChainIdLike = number, AddressLike = string, HashLike = string> {
    transfer: (options: TransactionOptions<ChainIdLike, AddressLike>) => Promise<HashLike>;
    isNativeToken: (token: Token<ChainIdLike, AddressLike>) => boolean;
    waitForTransaction: (hash: HashLike) => Promise<void>;
    validateBalance: (options: TransactionOptions<ChainIdLike, AddressLike>) => Promise<boolean>;
    validateGas: (options: TransactionOptions<ChainIdLike, AddressLike>) => Promise<boolean>;
    getAvailableBalance: (options: TransactionOptions<ChainIdLike, AddressLike>) => Promise<string>;
}
