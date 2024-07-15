export interface NetworkProvider<ChainIdLike = number, AddressLike = string, HashLike = string> {
    connect: () => Promise<void>;
    getAccount: () => Promise<AddressLike>;
    switchChain: (chainId: ChainIdLike) => Promise<void>;
    getChainId: () => ChainIdLike;
    getAddressUrl: (chainId: ChainIdLike, address: AddressLike) => string | undefined;
    getTransactionUrl: (chainId: ChainIdLike, hash: HashLike) => string | undefined;
}
