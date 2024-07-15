export interface NetworkProvider<AddressLike = string, HashLike = string> {
    connect: () => Promise<void>;
    getAccount: () => Promise<AddressLike>;
    switchChain: (chainId: number) => Promise<void>;
    getChainId: () => number;
    getAddressUrl: (chainId: number, address: AddressLike) => string | undefined;
    getTransactionUrl: (chainId: number, hash: HashLike) => string | undefined;
}
